import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function Orders() {
  const { data: orders, error: fetchError, refetch } = useFetch('/orders');
  const { data: products, refetch: refetchProducts } = useFetch('/products');
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('sale');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const selectedProduct = products.find((p) => p.id === parseInt(productId));
    if (!selectedProduct) {
      setFormError('Lütfen bir ürün seç');
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
      refetch();
      refetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Sipariş oluşturulamadı');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      refetch();
    } catch (err) {
      setFormError('Durum güncellenemedi');
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.id.toString().includes(searchTerm) ||
    (o.type === 'sale' ? 'satış' : 'alım').includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      <input
        placeholder="Sipariş ID veya tip (satış/alım) ile ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '15px', width: '300px' }}
      />

      {(formError || fetchError) && <p style={{ color: 'red' }}>{formError || fetchError}</p>}

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
          {paginatedOrders.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
              <td>{o.type === 'sale' ? 'Satış' : 'Alım'}</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                >
                  <option value="pending">Beklemede</option>
                  <option value="processing">Hazırlanıyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </td>
              <td>{o.total}</td>
              <td>{new Date(o.created_at).toLocaleString('tr-TR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ← Önceki
        </button>
        <span>Sayfa {currentPage} / {totalPages || 1}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Sonraki →
        </button>
      </div>
    </div>
  );
}

export default Orders;