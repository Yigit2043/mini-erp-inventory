import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Loglar yüklenemedi');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionColor = (action) => {
    if (action === 'create') return 'green';
    if (action === 'update') return '#b58900';
    if (action === 'delete') return 'red';
    return 'inherit';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>İşlem Kayıtları (Audit Log)</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kullanıcı ID</th>
            <th>İşlem</th>
            <th>Varlık</th>
            <th>Detay</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.created_at).toLocaleString('tr-TR')}</td>
              <td>{log.user_id}</td>
              <td style={{ color: actionColor(log.action), fontWeight: 'bold' }}>{log.action}</td>
              <td>{log.entity_type} #{log.entity_id}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogs;