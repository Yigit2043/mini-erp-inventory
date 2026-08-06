import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      setError('Müşteriler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers', { name, email, phone });
      setName('');
      setEmail('');
      setPhone('');
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || 'Müşteri eklenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu müşteriyi silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      setError('Silme işlemi başarısız');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Müşteriler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit">Ekle</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>
                <button onClick={() => handleDelete(c.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;