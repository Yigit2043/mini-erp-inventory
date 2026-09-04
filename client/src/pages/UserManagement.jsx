import { Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function UserManagement() {
  const { data: users, error, refetch } = useFetch('/users');

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      refetch();
    } catch (err) {
      console.error('Rol güncellenemedi');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Kullanıcı Yönetimi</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Kayıt Tarihi</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;