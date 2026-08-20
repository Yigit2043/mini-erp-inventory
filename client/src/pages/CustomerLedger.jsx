import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function CustomerLedger() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('payment');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [customerRes, txRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/transactions?customer_id=${id}`),
      ]);
      setCustomer(customerRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      setError('Veriler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transactions', {
        customer_id: parseInt(id),
        type,
        amount: parseFloat(amount),
        note,
      });
      setAmount('');
      setNote('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız');
    }
  };

  if (error && !customer) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!customer) return <p style={{ textAlign: 'center' }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <Link to="/customers">← Müşterilere dön</Link>
      <h2>{customer.name} - Cari Hesap</h2>

      <div style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: customer.balance > 0 ? '#fff3cd' : '#d4edda'
      }}>
        <strong>Güncel Bakiye:</strong> {customer.balance} ₺
        {customer.balance > 0 ? ' (Müşteri borçlu)' : ' (Borç yok)'}
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="payment">Ödeme (Tahsilat)</option>
          <option value="debt">Borçlandırma</option>
        </select>
        <input
          placeholder="Tutar"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          placeholder="Açıklama (opsiyonel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit">Kaydet</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Hareket Geçmişi</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Tip</th>
            <th>Tutar</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.created_at).toLocaleString('tr-TR')}</td>
              <td style={{ color: t.type === 'debt' ? 'red' : 'green', fontWeight: 'bold' }}>
                {t.type === 'debt' ? 'Borçlandırma' : 'Ödeme'}
              </td>
              <td>{t.amount} ₺</td>
              <td>{t.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerLedger;