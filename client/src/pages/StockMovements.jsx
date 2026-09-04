import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function StockMovements() {
  const { id } = useParams();
  const { data: movements, error } = useFetch(`/products/${id}/movements`, [id]);
  const { data: product } = useFetch(`/products/${id}`, [id]);

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <Link to="/products">← Ürünlere dön</Link>
      <h2>Stok Hareketleri {product?.name && `- ${product.name}`}</h2>

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