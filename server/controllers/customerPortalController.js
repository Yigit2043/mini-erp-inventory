const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getMyOrders = asyncHandler(async (req, res) => {
  const { customerId } = req.customer;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const getMyLedger = asyncHandler(async (req, res) => {
  const { customerId } = req.customer;

  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, name, balance')
    .eq('id', customerId)
    .single();

  if (custError) throw new ApiError(404, 'Müşteri bulunamadı');

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (txError) throw new ApiError(400, txError.message);

  res.json({ customer, transactions });
});

module.exports = { getMyOrders, getMyLedger };