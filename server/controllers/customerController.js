const supabase = require('../config/supabase');

const getCustomers = async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const getCustomerById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Müşteri bulunamadı' });
  res.json(data);
};

const createCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name zorunlu' });
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, email, phone }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Müşteri bulunamadı' });
  res.json(data[0]);
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Müşteri silindi' });
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };