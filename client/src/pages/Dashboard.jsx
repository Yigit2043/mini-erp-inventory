import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    criticalProducts: 0,
    totalCustomers: 0,
    todayOrders: 0,
  });
  const [balances, setBalances] = useState({
    totalReceivable: 0,
    totalPayable: 0,
  });
  const [topDebtors, setTopDebtors] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchStats = async () => {
    try {
      const [productsRes, customersRes, ordersRes, balanceRes, debtorsRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders'),
        api.get('/reports/balance-summary'),
        api.get('/reports/top-debtors'),
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
    } catch (err) {
      console.error('İstatistikler yüklenemedi', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    minWidth: '150px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Çıkış Yap</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h3>{stats.totalProducts}</h3>
          <p>Toplam Ürün</p>
        </div>

        <Link to="/critical-stock" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ ...cardStyle, borderColor: stats.criticalProducts > 0 ? 'red' : '#ccc', cursor: 'pointer' }}>
            <h3 style={{ color: stats.criticalProducts > 0 ? 'red' : 'inherit' }}>
              {stats.criticalProducts}
            </h3>
            <p>Kritik Stoktaki Ürün</p>
          </div>
        </Link>

        <div style={cardStyle}>
          <h3>{stats.totalCustomers}</h3>
          <p>Toplam Müşteri</p>
        </div>
        <div style={cardStyle}>
          <h3>{stats.todayOrders}</h3>
          <p>Bugünkü Sipariş</p>
        </div>

        <div style={{ ...cardStyle, borderColor: balances.totalReceivable > 0 ? '#16a34a' : '#ccc' }}>
          <h3 style={{ color: balances.totalReceivable > 0 ? '#16a34a' : 'inherit' }}>
            {balances.totalReceivable} ₺
          </h3>
          <p>Toplam Alacak</p>
        </div>

        <div style={{ ...cardStyle, borderColor: balances.totalPayable > 0 ? 'red' : '#ccc' }}>
          <h3 style={{ color: balances.totalPayable > 0 ? 'red' : 'inherit' }}>
            {balances.totalPayable} ₺
          </h3>
          <p>Toplam Borç</p>
        </div>
      </div>

      {topDebtors.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>En Çok Borçlu Müşteriler</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {topDebtors.map((d) => (
                <tr key={d.id}>
                  <td><Link to={`/customers/${d.id}/ledger`}>{d.name}</Link></td>
                  <td style={{ color: 'red', fontWeight: 'bold' }}>{d.balance} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav style={{ marginTop: '30px' }}>
        <Link to="/products">Ürünler</Link> <Link to="/customers">Müşteriler</Link> <Link to="/orders">Siparişler</Link> <Link to="/critical-stock">Kritik Stok</Link> <Link to="/categories">Kategoriler</Link> <Link to="/suppliers">Tedarikçiler</Link> <Link to="/reports">Raporlar</Link> <Link to="/users">Kullanıcılar</Link> <Link to="/audit-logs">İşlem Kayıtları</Link> <Link to="/profile">Profilim</Link>
      </nav>
    </div>
  );
}

export default Dashboard;