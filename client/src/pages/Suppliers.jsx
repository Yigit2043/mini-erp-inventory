import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function Suppliers() {
  const { data: suppliers, error: fetchError, refetch } = useFetch('/suppliers');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/suppliers', { name, contact_person: contactPerson, phone, email });
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Tedarikçi eklenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu tedarikçiyi silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Silme başarısız');
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

      {(formError || fetchError) && <p style={{ color: 'red' }}>{formError || fetchError}</p>}

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
                <button onClick={() => handleDelete(s.id)}>Sil</button>{' '}
                <Link to={`/suppliers/${s.id}/ledger`}>Cari Hesap</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;