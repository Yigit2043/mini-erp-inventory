const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Tüm ürünleri getir
const getProducts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

// Tek ürün getir
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

// Yeni ürün ekle
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, price, stock_qty, critical_level } = req.body;

  if (!name || !sku || price === undefined) {
    const err = new Error('name, sku ve price zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name, sku, price, stock_qty: stock_qty ?? 0, critical_level: critical_level ?? 5 }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.status(201).json(data[0]);
});

// Ürün güncelle
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
  res.json(data[0]);
});

// Ürün sil
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json({ message: 'Ürün silindi' });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };