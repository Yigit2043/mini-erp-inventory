import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function StockMovements() {
  const { id } = useParams();
  const [movements, setMovements] = useState([]);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [movementsRes, productRes] = await Promise.all([
        api.get(`/products/${id}/movements`),
        api.get(`/products/${id}`),
      ]);
      setMovements(movementsRes.data);
      setProduct(productRes.data);
    } catch (err) {
      setError('Veriler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <Link to="/products">← Ürünlere dön</Link>
      <h2>Stok Hareketleri {product && `- ${product.name}`}</h2>

      {movements.length === 0 ? (
        <p>Bu ürün için henüz stok hareketi yok</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Değişim</th>
              <th>Sebep</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                <td style={{ color: m.change_qty < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                  {m.change_qty > 0 ? '+' : ''}{m.change_qty}
                </td>
                <td>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockMovements;