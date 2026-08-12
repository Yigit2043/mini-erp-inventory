const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

const getSuppliers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('suppliers').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

const createSupplier = asyncHandler(async (req, res) => {
  const { name, contact_person, phone, email } = req.body;

  if (!name) {
    const err = new Error('name zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert([{ name, contact_person, phone, email }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.status(201).json(data[0]);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json({ message: 'Tedarikçi silindi' });
});

module.exports = { getSuppliers, createSupplier, deleteSupplier };