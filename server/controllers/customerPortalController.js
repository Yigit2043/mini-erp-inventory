const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Giriş yapmış müşterinin kendi siparişlerini getirir
const getMyOrders = asyncHandler(async (req, res) => {
  const { customerId } = req.customer;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  res.json(data);
});

// Giriş yapmış müşterinin kendi cari hesabını (bakiye + hareketler) getirir
const getMyLedger = asyncHandler(async (req, res) => {
  const { customerId } = req.customer;

  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, name, balance')
    .eq('id', customerId)
    .single();

  if (custError) {
    const err = new Error('Müşteri bulunamadı');
    err.statusCode = 404;
    throw err;
  }

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (txError) {
    const err = new Error(txError.message);
    err.statusCode = 400;
    throw err;
  }

  res.json({ customer, transactions });
});

module.exports = { getMyOrders, getMyLedger };