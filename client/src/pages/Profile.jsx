import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Profile() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Şifreniz başarıyla güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Şifre değiştirilemedi');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Profilim</h2>

      <h3>Şifre Değiştir</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="password"
            placeholder="Mevcut şifre"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Yeni şifre (en az 6 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Yeni şifre (tekrar)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Şifreyi Güncelle</button>
      </form>
    </div>
  );
}

export default Profile;