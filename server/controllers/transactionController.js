const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');

// Bir müşterinin veya tedarikçinin hareket geçmişini getirir
const getTransactions = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id } = req.query;

  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });

  if (customer_id) query = query.eq('customer_id', customer_id);
  if (supplier_id) query = query.eq('supplier_id', supplier_id);

  const { data, error } = await query;

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  res.json(data);
});

// Manuel bir ödeme/tahsilat kaydı oluşturur ve bakiyeyi günceller
const createTransaction = asyncHandler(async (req, res) => {
  const { customer_id, supplier_id, type, amount, note } = req.body;

  if (!type || !amount || (!customer_id && !supplier_id)) {
    const err = new Error('type, amount ve customer_id veya supplier_id zorunlu');
    err.statusCode = 400;
    throw err;
  }

  // Hareketi kaydet
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ customer_id, supplier_id, type, amount, note }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  // Bakiyeyi güncelle
  const table = customer_id ? 'customers' : 'suppliers';
  const id = customer_id || supplier_id;

  const { data: entity } = await supabase.from(table).select('balance').eq('id', id).single();
  const currentBalance = entity?.balance || 0;

  // debt (borçlanma) bakiyeyi artırır, payment (ödeme) azaltır
  const change = type === 'debt' ? amount : -amount;
  const newBalance = currentBalance + change;

  await supabase.from(table).update({ balance: newBalance }).eq('id', id);

  await logAction(req.user.id, 'create', 'transaction', data[0].id, `${type}: ${amount}`);

  res.status(201).json({ transaction: data[0], newBalance });
});

module.exports = { getTransactions, createTransaction };