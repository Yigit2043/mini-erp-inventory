const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Son 6 ayın satış toplamlarını aylık gruplar
const getMonthlySales = asyncHandler(async (req, res) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, type, created_at')
    .eq('type', 'sale');

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const monthlyTotals = {};
  orders.forEach((order) => {
    const monthKey = order.created_at.slice(0, 7);
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + order.total;
  });

  const result = Object.entries(monthlyTotals)
    .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  res.json(result);
});

// En çok satılan ürünleri getirir (adet bazında)
const getTopProducts = asyncHandler(async (req, res) => {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('qty, products(name)');

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const productTotals = {};
  items.forEach((item) => {
    const name = item.products?.name || 'Bilinmeyen';
    productTotals[name] = (productTotals[name] || 0) + item.qty;
  });

  const result = Object.entries(productTotals)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  res.json(result);
});

// Toplam alacak (müşterilerden) ve toplam borç (tedarikçilere) özetini getirir
const getBalanceSummary = asyncHandler(async (req, res) => {
  const { data: customers, error: custError } = await supabase.from('customers').select('balance');
  const { data: suppliers, error: supError } = await supabase.from('suppliers').select('balance');

  if (custError || supError) {
    const err = new Error('Bakiye özeti alınamadı');
    err.statusCode = 400;
    throw err;
  }

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  res.json({
    totalReceivable: Math.round(totalReceivable * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
  });
});

module.exports = { getMonthlySales, getTopProducts, getBalanceSummary };