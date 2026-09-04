import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

function Warehouses() {
  const { data: warehouses, error: fetchError, refetch } = useFetch('/warehouses');
  const { data: products } = useFetch('/products');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [stockProductId, setStockProductId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/warehouses', { name, location });
      setName('');
      setLocation('');
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Depo eklenemedi');
    }
  };

  const viewWarehouseStock = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    try {
      const res = await api.get(`/warehouses/${warehouse.id}/stock`);
      setWarehouseStock(res.data);
    } catch (err) {
      setFormError('Depo stoğu yüklenemedi');
    }
  };

  const handleSetStock = async (e) => {
    e.preventDefault();
    setFormError('');
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
      setFormError('Stok ayarlanamadı');
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

      {(formError || fetchError) && <p style={{ color: 'red' }}>{formError || fetchError}</p>}

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