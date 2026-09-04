const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getSuppliers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('suppliers').select('*');
  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const createSupplier = asyncHandler(async (req, res) => {
  const { name, contact_person, phone, email } = req.body;

  if (!name) throw new ApiError(400, 'name zorunlu');

  const { data, error } = await supabase
    .from('suppliers')
    .insert([{ name, contact_person, phone, email }])
    .select();

  if (error) throw new ApiError(400, error.message);
  res.status(201).json(data[0]);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw new ApiError(400, error.message);
  res.json({ message: 'Tedarikçi silindi' });
});

module.exports = { getSuppliers, createSupplier, deleteSupplier };