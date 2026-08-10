import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
      setItems(res.data.items);
    } catch (err) {
      setError('Sipariş yüklenemedi');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!order) return <p style={{ textAlign: 'center' }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/orders">← Siparişlere dön</Link>
      <h2>Sipariş #{order.id}</h2>

      <p><strong>Tip:</strong> {order.type === 'sale' ? 'Satış' : 'Alım'}</p>
      <p><strong>Durum:</strong> {order.status}</p>
      <p><strong>Toplam:</strong> {order.total} ₺</p>
      <p><strong>Tarih:</strong> {new Date(order.created_at).toLocaleString('tr-TR')}</p>

      <h3>Ürünler</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Ürün</th>
            <th>SKU</th>
            <th>Adet</th>
            <th>Birim Fiyat</th>
            <th>Ara Toplam</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.products?.name}</td>
              <td>{item.products?.sku}</td>
              <td>{item.qty}</td>
              <td>{item.unit_price} ₺</td>
              <td>{(item.qty * item.unit_price).toFixed(2)} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderDetail;