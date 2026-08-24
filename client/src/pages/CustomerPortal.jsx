import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerApi from '../services/customerApi';

function CustomerPortal() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const customerName = localStorage.getItem('customerName');

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    navigate('/portal/login');
  };

  const fetchData = async () => {
    try {
      const [ordersRes, ledgerRes] = await Promise.all([
        customerApi.get('/customer-auth/my-orders'),
        customerApi.get('/customer-auth/my-ledger'),
      ]);
      setOrders(ordersRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      setError('Veriler yüklenemedi, tekrar giriş yapmayı deneyin');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hoş geldin, {customerName}</h2>
        <button onClick={handleLogout}>Çıkış Yap</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {ledger && (
        <div style={{
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: ledger.customer.balance > 0 ? '#fff3cd' : '#d4edda'
        }}>
          <strong>Güncel Bakiye:</strong> {ledger.customer.balance} ₺
        </div>
      )}

      <h3>Siparişlerim</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Durum</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.created_at).toLocaleString('tr-TR')}</td>
              <td>{o.status}</td>
              <td>{o.total} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>

      {ledger && (
        <>
          <h3>Hesap Hareketlerim</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tip</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {ledger.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString('tr-TR')}</td>
                  <td>{t.type === 'debt' ? 'Borçlandırma' : 'Ödeme'}</td>
                  <td>{t.amount} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default CustomerPortal;