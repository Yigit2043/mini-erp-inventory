
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Çıkış Yap</button>
      </div>
      <p>Giriş başarili! Buraya ürün, müşteri ve sipariş özetleri gelecek.</p>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/products">Ürünler</Link>
      </nav>
    </div>
  );
}

export default Dashboard;