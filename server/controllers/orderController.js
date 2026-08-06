const supabase = require('../config/supabase');

// Tüm siparişleri getir
const getOrders = async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Yeni sipariş oluştur
const createOrder = async (req, res) => {
  const { customer_id, type, items } = req.body;
  // items örneği: [{ product_id: 1, qty: 2, unit_price: 99.90 }, ...]

  if (!type || !items || !items.length) {
    return res.status(400).json({ error: 'type ve items zorunlu' });
  }

  // Toplam tutarı hesapla (2 ondalık basamağa yuvarlanmış)
  const total = Math.round(items.reduce((sum, item) => sum + item.qty * item.unit_price, 0) * 100) / 100;

  // 1. Siparişi oluştur
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ customer_id, type, status: 'completed', total }])
    .select();

  if (orderError) return res.status(400).json({ error: orderError.message });

  const order = orderData[0];

  // 2. Her ürün için order_items, stok güncelleme ve stock_movements işlemleri
  for (const item of items) {
    // order_items'a ekle
    await supabase.from('order_items').insert([{
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price
    }]);

    // Mevcut stok miktarını al
    const { data: productData } = await supabase
      .from('products')
      .select('stock_qty')
      .eq('id', item.product_id)
      .single();

    const changeQty = type === 'sale' ? -item.qty : item.qty;
    const newStock = productData.stock_qty + changeQty;

    // Stoku güncelle
    await supabase
      .from('products')
      .update({ stock_qty: newStock })
      .eq('id', item.product_id);

    // Stok hareketi kaydet
    await supabase.from('stock_movements').insert([{
      product_id: item.product_id,
      change_qty: changeQty,
      reason: type === 'sale' ? 'Satış' : 'Alım',
      order_id: order.id
    }]);
  }

  res.status(201).json({ message: 'Sipariş oluşturuldu', order });
};

module.exports = { getOrders, createOrder };