const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');
const ApiError = require('../utils/ApiError');

const getOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw new ApiError(404, 'Sipariş bulunamadı');

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(name, sku)')
    .eq('order_id', id);

  if (itemsError) throw new ApiError(400, itemsError.message);

  res.json({ order, items });
});

const createOrder = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id, type, items } = req.body;

  if (!type || !items || !items.length) {
    throw new ApiError(400, 'type ve items zorunlu');
  }

  const { data: order, error } = await supabase.rpc('create_order', {
    p_customer_id: customer_id || null,
    p_supplier_id: supplier_id || null,
    p_type: type,
    p_items: items.map((item) => ({ product_id: item.product_id, qty: item.qty })),
  });

  if (error) throw new ApiError(400, error.message);

  await logAction(req.user.id, 'create', 'order', order.id, `${type === 'sale' ? 'Satış' : 'Alım'} siparişi oluşturuldu, toplam: ${order.total}`);

  res.status(201).json({ message: 'Sipariş oluşturuldu', order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, 'Geçerli bir durum girin: pending, processing, completed, cancelled');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) throw new ApiError(400, error.message);

  await logAction(req.user.id, 'update', 'order', id, `Durum değiştirildi: ${status}`);

  res.json(data[0]);
});

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };