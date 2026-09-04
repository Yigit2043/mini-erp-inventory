const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendCriticalStockAlert } = require('../utils/emailSender');
const ApiError = require('../utils/ApiError');

const checkAndNotify = asyncHandler(async (req, res) => {
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) throw new ApiError(400, error.message);

  const criticalProducts = products.filter((p) => p.stock_qty <= p.critical_level);

  if (criticalProducts.length === 0) {
    return res.json({ message: 'Kritik seviyede ürün yok, email gönderilmedi', count: 0 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', req.user.id)
    .single();

  await sendCriticalStockAlert(user.email, criticalProducts);

  res.json({ message: 'Kritik stok uyarısı email ile gönderildi', count: criticalProducts.length });
});

module.exports = { checkAndNotify };