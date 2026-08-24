import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerApi from '../services/customerApi';

function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await customerApi.post('/customer-auth/login', { email, password });
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('customerName', res.data.customerName);
      navigate('/portal');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <h2>Müşteri Portalı - Giriş</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

export default CustomerLogin;