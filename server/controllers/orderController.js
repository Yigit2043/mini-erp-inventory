const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { calculateTotal, calculateStockChange } = require('../utils/orderUtils');
const { logAction } = require('../utils/auditLogger');

const getOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    const err = new Error('Sipariş bulunamadı');
    err.statusCode = 404;
    throw err;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(name, sku)')
    .eq('order_id', id);

  if (itemsError) {
    const err = new Error(itemsError.message);
    err.statusCode = 400;
    throw err;
  }

  res.json({ order, items });
});

const createOrder = asyncHandler(async (req, res) => {
  const { customer_id, type, items } = req.body;

  if (!type || !items || !items.length) {
    const err = new Error('type ve items zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const productIds = items.map((item) => item.product_id);

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock_qty')
    .in('id', productIds);

  if (productsError) {
    const err = new Error(productsError.message);
    err.statusCode = 400;
    throw err;
  }

  const productMap = {};
  products.forEach((p) => { productMap[p.id] = p; });

  // TÜM doğrulamalar (ürün var mı, adet geçerli mi, stok yeterli mi)
  // herhangi bir INSERT yapmadan önce tamamlanıyor — böylece hata durumunda
  // veritabanında yarım kalmış/yetim bir sipariş kaydı OLUŞMUYOR.
  for (const item of items) {
    const product = productMap[item.product_id];

    if (!product) {
      const err = new Error(`Ürün bulunamadı: ID ${item.product_id}`);
      err.statusCode = 400;
      throw err;
    }
    if (!item.qty || item.qty <= 0) {
      const err = new Error('Geçersiz adet girildi');
      err.statusCode = 400;
      throw err;
    }
    if (type === 'sale') {
      const projectedStock = product.stock_qty - item.qty;
      if (projectedStock < 0) {
        const err = new Error(
          `Yetersiz stok: ürün ID ${product.id} için mevcut stok ${product.stock_qty}, istenen ${item.qty}`
        );
        err.statusCode = 400;
        throw err;
      }
    }
  }

  // Doğrulamalar geçti — fiyatları DAİMA veritabanından al, isteğin içinden değil
  const verifiedItems = items.map((item) => ({
    product_id: item.product_id,
    qty: item.qty,
    unit_price: productMap[item.product_id].price,
  }));

  const total = calculateTotal(verifiedItems);

  // Artık güvenle sipariş kaydını oluşturabiliriz
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ customer_id, type, status: 'pending', total }])
    .select();

  if (orderError) {
    const err = new Error(orderError.message);
    err.statusCode = 400;
    throw err;
  }

  const order = orderData[0];

  for (const item of verifiedItems) {
    await supabase.from('order_items').insert([{
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price
    }]);

    const currentStock = productMap[item.product_id].stock_qty;
    const changeQty = calculateStockChange(type, item.qty);
    const newStock = currentStock + changeQty;

    await supabase
      .from('products')
      .update({ stock_qty: newStock })
      .eq('id', item.product_id);

    await supabase.from('stock_movements').insert([{
      product_id: item.product_id,
      change_qty: changeQty,
      reason: type === 'sale' ? 'Satış' : 'Alım',
      order_id: order.id
    }]);
  }

  await logAction(req.user.id, 'create', 'order', order.id, `${type === 'sale' ? 'Satış' : 'Alım'} siparişi oluşturuldu, toplam: ${total}`);

  res.status(201).json({ message: 'Sipariş oluşturuldu', order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    const err = new Error('Geçerli bir durum girin: pending, processing, completed, cancelled');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'update', 'order', id, `Durum değiştirildi: ${status}`);

  res.json(data[0]);
});

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };