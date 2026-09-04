import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function SupplierLedger() {
  const { id } = useParams();
  const { data: suppliers } = useFetch('/suppliers');
  const { data: transactions, refetch: refetchTransactions } = useFetch(`/transactions?supplier_id=${id}`, [id]);
  const supplier = suppliers.find((s) => s.id === parseInt(id));
  const [type, setType] = useState('payment');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transactions', {
        supplier_id: parseInt(id),
        type,
        amount: parseFloat(amount),
        note,
      });
      setAmount('');
      setNote('');
      refetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız');
    }
  };

  if (!supplier) return <p style={{ textAlign: 'center' }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <Link to="/suppliers">← Tedarikçilere dön</Link>
      <h2>{supplier.name} - Cari Hesap</h2>

      <div style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: supplier.balance > 0 ? '#fff3cd' : '#d4edda'
      }}>
        <strong>Güncel Bakiye:</strong> {supplier.balance} ₺
        {supplier.balance > 0 ? ' (Tedarikçiye borçlusun)' : ' (Borç yok)'}
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="payment">Ödeme</option>
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

export default SupplierLedger;