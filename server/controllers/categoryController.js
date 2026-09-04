const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) throw new ApiError(400, 'name zorunlu');

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select();

  if (error) throw new ApiError(400, error.message);
  res.status(201).json(data[0]);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new ApiError(400, error.message);
  res.json({ message: 'Kategori silindi' });
});

module.exports = { getCategories, createCategory, deleteCategory };