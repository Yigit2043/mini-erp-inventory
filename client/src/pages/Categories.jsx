import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function Categories() {
  const { data: categories, error: fetchError, refetch } = useFetch('/categories');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/categories', { name });
      setName('');
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Kategori eklenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/categories/${id}`);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Silme başarısız');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Kategoriler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          placeholder="Kategori adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Ekle</button>
      </form>

      {(formError || fetchError) && <p style={{ color: 'red' }}>{formError || fetchError}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
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

export default Categories;