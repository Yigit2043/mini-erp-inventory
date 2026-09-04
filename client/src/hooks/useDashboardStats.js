import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Dashboard için gereken tüm veriyi paralel çeker ve
// özet istatistikleri (kritik ürün sayısı, bugünkü sipariş sayısı vb.) hesaplar.
function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    criticalProducts: 0,
    totalCustomers: 0,
    todayOrders: 0,
  });
  const [balances, setBalances] = useState({ totalReceivable: 0, totalPayable: 0 });
  const [topDebtors, setTopDebtors] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    try {
      const [productsRes, customersRes, ordersRes, balanceRes, debtorsRes, reorderRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders'),
        api.get('/reports/balance-summary'),
        api.get('/reports/top-debtors'),
        api.get('/reports/reorder-suggestions'),
      ]);

      const products = productsRes.data;
      const customers = customersRes.data;
      const orders = ordersRes.data;

      const critical = products.filter((p) => p.stock_qty <= p.critical_level);

      const today = new Date().toDateString();
      const todayOrdersCount = orders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      ).length;

      setStats({
        totalProducts: products.length,
        criticalProducts: critical.length,
        totalCustomers: customers.length,
        todayOrders: todayOrdersCount,
      });

      setBalances(balanceRes.data);
      setTopDebtors(debtorsRes.data);
      setReorderSuggestions(reorderRes.data);
    } catch (err) {
      setError('İstatistikler yüklenemedi');
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, balances, topDebtors, reorderSuggestions, error, refetch };
}

export default useDashboardStats;