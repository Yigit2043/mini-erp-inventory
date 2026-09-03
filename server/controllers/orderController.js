const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
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

// Sipariş oluşturma artık TEK bir veritabanı fonksiyonu (RPC) çağırıyor.
// Fiyat kontrolü, stok kontrolü, sipariş+kalem+hareket kaydı hepsi
// veritabanının içinde, TEK bir transaction olarak çalışıyor.
// Ortasında herhangi bir adım hata verirse, HİÇBİR ŞEY kaydedilmiyor.
const createOrder = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id, type, items } = req.body;

  if (!type || !items || !items.length) {
    const err = new Error('type ve items zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data: order, error } = await supabase.rpc('create_order', {
    p_customer_id: customer_id || null,
    p_supplier_id: supplier_id || null,
    p_type: type,
    p_items: items.map((item) => ({ product_id: item.product_id, qty: item.qty })),
  });

  if (error) {
    // Postgres fonksiyonu içindeki raise exception mesajları buraya düşer
    // (örn. "Yetersiz stok: ürün ID 1 için mevcut stok 0, istenen 1")
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'create', 'order', order.id, `${type === 'sale' ? 'Satış' : 'Alım'} siparişi oluşturuldu, toplam: ${order.total}`);

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