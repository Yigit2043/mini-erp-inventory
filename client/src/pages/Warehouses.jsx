import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [stockProductId, setStockProductId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [error, setError] = useState('');

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      setError('Depolar yüklenemedi');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Ürünler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/warehouses', { name, location });
      setName('');
      setLocation('');
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.error || 'Depo eklenemedi');
    }
  };

  const viewWarehouseStock = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    try {
      const res = await api.get(`/warehouses/${warehouse.id}/stock`);
      setWarehouseStock(res.data);
    } catch (err) {
      setError('Depo stoğu yüklenemedi');
    }
  };

  const handleSetStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/warehouses/product-stock', {
        product_id: parseInt(stockProductId),
        warehouse_id: selectedWarehouse.id,
        stock_qty: parseInt(stockQty),
      });
      setStockProductId('');
      setStockQty('');
      viewWarehouseStock(selectedWarehouse);
    } catch (err) {
      setError('Stok ayarlanamadı');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Depolar / Şubeler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          placeholder="Depo adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Konum (opsiyonel)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">Depo Ekle</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Konum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.location}</td>
              <td>
                <button onClick={() => viewWarehouseStock(w)}>Stoğu Görüntüle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedWarehouse && (
        <div>
          <h3>{selectedWarehouse.name} - Stok Durumu</h3>

          <form onSubmit={handleSetStock} style={{ marginBottom: '20px' }}>
            <select value={stockProductId} onChange={(e) => setStockProductId(e.target.value)} required>
              <option value="">Ürün seç</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              placeholder="Miktar"
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              required
            />
            <button type="submit">Stoğu Ayarla</button>
          </form>

          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>SKU</th>
                <th>Miktar</th>
              </tr>
            </thead>
            <tbody>
              {warehouseStock.map((s) => (
                <tr key={s.id}>
                  <td>{s.products?.name}</td>
                  <td>{s.products?.sku}</td>
                  <td>{s.stock_qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Warehouses;