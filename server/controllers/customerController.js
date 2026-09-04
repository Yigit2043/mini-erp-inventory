const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');
const ApiError = require('../utils/ApiError');

const getCustomers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) throw new ApiError(404, 'Müşteri bulunamadı');
  res.json(data);
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name) throw new ApiError(400, 'name zorunlu');

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, email, phone }])
    .select();

  if (error) throw new ApiError(400, error.message);

  await logAction(req.user.id, 'create', 'customer', data[0].id, `${name} eklendi`);

  res.status(201).json(data[0]);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw new ApiError(400, error.message);
  if (!data.length) throw new ApiError(404, 'Müşteri bulunamadı');

  await logAction(req.user.id, 'update', 'customer', id, 'Müşteri güncellendi');

  res.json(data[0]);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new ApiError(400, error.message);

  await logAction(req.user.id, 'delete', 'customer', id, 'Müşteri silindi');

  res.json({ message: 'Müşteri silindi' });
});

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };