const supabase = require('../config/supabase');

// Tüm ürünleri getir
const getProducts = async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Tek ürün getir
const getProductById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Ürün bulunamadı' });
  res.json(data);
};

// Yeni ürün ekle
const createProduct = async (req, res) => {
  const { name, sku, price, stock_qty, critical_level } = req.body;

  if (!name || !sku || price === undefined) {
    return res.status(400).json({ error: 'name, sku ve price zorunlu' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name, sku, price, stock_qty: stock_qty ?? 0, critical_level: critical_level ?? 5 }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

// Ürün güncelle
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Ürün bulunamadı' });
  res.json(data[0]);
};

// Ürün sil
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Ürün silindi' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };