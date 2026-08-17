const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');

const getProducts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) {
    const err = new Error('Ürün bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  res.json(data);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, price, stock_qty, critical_level, category_id } = req.body;

  if (!name || !sku || price === undefined) {
    const err = new Error('name, sku ve price zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name, sku, price, stock_qty: stock_qty ?? 0, critical_level: critical_level ?? 5, category_id }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'create', 'product', data[0].id, `${name} eklendi`);

  res.status(201).json(data[0]);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  if (!data.length) {
    const err = new Error('Ürün bulunamadı');
    err.statusCode = 404;
    throw err;
  }

  await logAction(req.user.id, 'update', 'product', id, 'Ürün güncellendi');

  res.json(data[0]);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'delete', 'product', id, 'Ürün silindi');

  res.json({ message: 'Ürün silindi' });
});

// Bir ürünün stok hareket geçmişini getirir
const getStockMovements = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  res.json(data);
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getStockMovements };