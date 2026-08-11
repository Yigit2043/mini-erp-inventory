const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Tüm kategorileri getir
const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

// Yeni kategori ekle
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('name zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.status(201).json(data[0]);
});

// Kategori sil
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json({ message: 'Kategori silindi' });
});

module.exports = { getCategories, createCategory, deleteCategory };