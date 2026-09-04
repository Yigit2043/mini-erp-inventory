const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getMonthlySales = asyncHandler(async (req, res) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, type, created_at')
    .eq('type', 'sale');

  if (error) throw new ApiError(400, error.message);

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

const getTopProducts = asyncHandler(async (req, res) => {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('qty, products(name)');

  if (error) throw new ApiError(400, error.message);

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

const getBalanceSummary = asyncHandler(async (req, res) => {
  const { data: customers, error: custError } = await supabase.from('customers').select('balance');
  const { data: suppliers, error: supError } = await supabase.from('suppliers').select('balance');

  if (custError || supError) throw new ApiError(400, 'Bakiye özeti alınamadı');

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  res.json({
    totalReceivable: Math.round(totalReceivable * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
  });
});

const getTopDebtors = asyncHandler(async (req, res) => {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, balance')
    .gt('balance', 0)
    .order('balance', { ascending: false })
    .limit(10);

  if (error) throw new ApiError(400, error.message);
  res.json(customers);
});

const getReorderSuggestions = asyncHandler(async (req, res) => {
  const { data: products, error: prodError } = await supabase.from('products').select('*');
  if (prodError) throw new ApiError(400, prodError.message);

  const { data: movements, error: movError } = await supabase
    .from('stock_movements')
    .select('product_id, change_qty, created_at')
    .lt('change_qty', 0);

  if (movError) throw new ApiError(400, movError.message);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const suggestions = products.map((product) => {
    const productMovements = movements.filter(
      (m) => m.product_id === product.id && new Date(m.created_at) >= thirtyDaysAgo
    );

    const totalSold = productMovements.reduce((sum, m) => sum + Math.abs(m.change_qty), 0);

    let daysOfData = 30;
    if (productMovements.length > 0) {
      const earliestDate = new Date(Math.min(...productMovements.map((m) => new Date(m.created_at))));
      const daysDiff = Math.ceil((new Date() - earliestDate) / (1000 * 60 * 60 * 24));
      daysOfData = Math.max(daysDiff, 1);
    }

    const avgDailySales = totalSold / daysOfData;
    const daysUntilStockout = avgDailySales > 0 ? Math.floor(product.stock_qty / avgDailySales) : null;

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock_qty: product.stock_qty,
      critical_level: product.critical_level,
      avgDailySales: Math.round(avgDailySales * 100) / 100,
      daysUntilStockout,
      shouldReorder: daysUntilStockout !== null && daysUntilStockout <= 14,
    };
  }).filter((p) => p.shouldReorder);

  res.json(suggestions);
});

module.exports = { getMonthlySales, getTopProducts, getBalanceSummary, getTopDebtors, getReorderSuggestions };