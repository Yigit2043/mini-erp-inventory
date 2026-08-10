const supabase = require('../config/supabase');

// Tüm siparişleri getir
const getOrders = async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Tek sipariş + içindeki ürünleri getir
const getOrderById = async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) return res.status(404).json({ error: 'Sipariş bulunamadı' });

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(name, sku)')
    .eq('order_id', id);

  if (itemsError) return res.status(400).json({ error: itemsError.message });

  res.json({ order, items });
};

// Yeni sipariş oluştur
const createOrder = async (req, res) => {
  const { customer_id, type, items } = req.body;

  if (!type || !items || !items.length) {
    return res.status(400).json({ error: 'type ve items zorunlu' });
  }

  const total = Math.round(items.reduce((sum, item) => sum + item.qty * item.unit_price, 0) * 100) / 100;

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ customer_id, type, status: 'completed', total }])
    .select();

  if (orderError) return res.status(400).json({ error: orderError.message });

  const order = orderData[0];

  for (const item of items) {
    await supabase.from('order_items').insert([{
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price
    }]);

    const { data: productData } = await supabase
      .from('products')
      .select('stock_qty')
      .eq('id', item.product_id)
      .single();

    const changeQty = type === 'sale' ? -item.qty : item.qty;
    const newStock = productData.stock_qty + changeQty;

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

  res.status(201).json({ message: 'Sipariş oluşturuldu', order });
};

module.exports = { getOrders, getOrderById, createOrder };