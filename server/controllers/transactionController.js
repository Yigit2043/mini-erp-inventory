const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');
const ApiError = require('../utils/ApiError');

const getTransactions = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id } = req.query;

  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });

  if (customer_id) query = query.eq('customer_id', customer_id);
  if (supplier_id) query = query.eq('supplier_id', supplier_id);

  const { data, error } = await query;

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const createTransaction = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id, type, amount, note } = req.body;

  if (!type || amount === undefined || amount === null || (!customer_id && !supplier_id)) {
    throw new ApiError(400, 'type, amount ve customer_id veya supplier_id zorunlu');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ customer_id, supplier_id, type, amount, note }])
    .select();

  if (error) throw new ApiError(400, error.message);

  const table = customer_id ? 'customers' : 'suppliers';
  const id = customer_id || supplier_id;

  const { data: entity } = await supabase.from(table).select('balance').eq('id', id).single();
  const currentBalance = entity?.balance || 0;

  const change = type === 'debt' ? amount : -amount;
  const newBalance = currentBalance + change;

  await supabase.from(table).update({ balance: newBalance }).eq('id', id);

  await logAction(
    req.user.id,
    'create',
    'transaction',
    data[0].id,
    `${type === 'debt' ? 'Borçlandırma' : 'Ödeme'}: ${amount} — ${table === 'customers' ? 'Müşteri' : 'Tedarikçi'} ID ${id}, yeni bakiye: ${newBalance}`
  );

  res.status(201).json({ transaction: data[0], newBalance });
});

module.exports = { getTransactions, createTransaction };