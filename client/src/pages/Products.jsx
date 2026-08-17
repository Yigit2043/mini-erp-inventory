import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Ürünler yüklenemedi');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Kategoriler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setStockQty('');
    setCategoryId('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name,
      sku,
      price: parseFloat(price),
      stock_qty: parseInt(stockQty) || 0,
      category_id: categoryId ? parseInt(categoryId) : null,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price);
    setStockQty(product.stock_qty);
    setCategoryId(product.category_id || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError('Silme işlemi başarısız');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '-';
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Ürünler</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          placeholder="Ürün adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <input
          placeholder="Fiyat"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          placeholder="Stok adedi"
          type="number"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Kategori seç (opsiyonel)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Güncelle' : 'Ekle'}</button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '8px', backgroundColor: '#94a3b8' }}>
            İptal
          </button>
        )}
      </form>

      <input
        placeholder="Ürün adı veya SKU ile ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '15px', width: '300px' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>SKU</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Kategori</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.price}</td>
              <td>{p.stock_qty}</td>
              <td>{getCategoryName(p.category_id)}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Düzenle</button>{' '}
                <button onClick={() => handleDelete(p.id)}>Sil</button>{' '}
                <Link to={`/products/${p.id}/movements`}>Geçmiş</Link>
              </td>
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

export default Products;