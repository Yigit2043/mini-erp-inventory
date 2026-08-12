import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      setError('Tedarikçiler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/suppliers', { name, contact_person: contactPerson, phone, email });
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Tedarikçi eklenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu tedarikçiyi silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Silme başarısız');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Tedarikçiler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          placeholder="Firma adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Yetkili kişi"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Ekle</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Firma</th>
            <th>Yetkili</th>
            <th>Telefon</th>
            <th>Email</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.contact_person}</td>
              <td>{s.phone}</td>
              <td>{s.email}</td>
              <td>
                <button onClick={() => handleDelete(s.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;