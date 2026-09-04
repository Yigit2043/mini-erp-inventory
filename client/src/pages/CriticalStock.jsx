import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function CriticalStock() {
  const { data: products, error } = useFetch('/products');
  const criticalProducts = products.filter((p) => p.stock_qty <= p.critical_level);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2 style={{ color: 'red' }}>⚠ Kritik Stoktaki Ürünler</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {criticalProducts.length === 0 ? (
        <p>Kritik seviyede ürün yok, her şey yolunda 👍</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ad</th>
              <th>SKU</th>
              <th>Mevcut Stok</th>
              <th>Kritik Seviye</th>
            </tr>
          </thead>
          <tbody>
            {criticalProducts.map((p) => (
              <tr key={p.id} style={{ backgroundColor: '#ffe6e6' }}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td style={{ color: 'red', fontWeight: 'bold' }}>{p.stock_qty}</td>
                <td>{p.critical_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CriticalStock;