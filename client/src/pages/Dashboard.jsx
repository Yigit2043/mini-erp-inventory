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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchStats = async () => {
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders'),
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
      </div>

      <nav style={{ marginTop: '30px' }}>
        <Link to="/products">Ürünler</Link> <Link to="/customers">Müşteriler</Link> <Link to="/orders">Siparişler</Link> <Link to="/critical-stock">Kritik Stok</Link> <Link to="/categories">Kategoriler</Link> <Link to="/suppliers">Tedarikçiler</Link> <Link to="/reports">Raporlar</Link> <Link to="/users">Kullanıcılar</Link> <Link to="/audit-logs">İşlem Kayıtları</Link>
      </nav>
    </div>
  );
}

export default Dashboard;