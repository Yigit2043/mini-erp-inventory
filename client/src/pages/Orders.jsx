import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('sale');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError('Siparişler yüklenemedi');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Ürünler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const selectedProduct = products.find((p) => p.id === parseInt(productId));
    if (!selectedProduct) {
      setError('Lütfen bir ürün seç');
      return;
    }

    try {
      await api.post('/orders', {
        customer_id: customerId ? parseInt(customerId) : null,
        type,
        items: [
          {
            product_id: selectedProduct.id,
            qty: parseInt(qty),
            unit_price: selectedProduct.price,
          },
        ],
      });
      setCustomerId('');
      setProductId('');
      setQty('');
      fetchOrders();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş oluşturulamadı');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Siparişler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="sale">Satış</option>
          <option value="purchase">Alım</option>
        </select>

        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Ürün seç</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stok: {p.stock_qty})
            </option>
          ))}
        </select>

        <input
          placeholder="Adet"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
        />

        <input
          placeholder="Müşteri ID (opsiyonel)"
          type="number"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />

        <button type="submit">Sipariş Oluştur</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tip</th>
            <th>Durum</th>
            <th>Toplam</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
              <td>{o.type === 'sale' ? 'Satış' : 'Alım'}</td>
              <td>{o.status}</td>
              <td>{o.total}</td>
              <td>{new Date(o.created_at).toLocaleString('tr-TR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;