import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get('/reports/monthly-sales'),
        api.get('/reports/top-products'),
      ]);
      setMonthlySales(salesRes.data);
      setTopProducts(productsRes.data);
    } catch (err) {
      setError('Raporlar yüklenemedi');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const salesChartData = {
    labels: monthlySales.map((s) => s.month),
    datasets: [
      {
        label: 'Aylık Satış (₺)',
        data: monthlySales.map((s) => s.total),
        backgroundColor: '#2563eb',
      },
    ],
  };

  const productsChartData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: 'Satılan Adet',
        data: topProducts.map((p) => p.qty),
        backgroundColor: '#16a34a',
      },
    ],
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Raporlar</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '50px' }}>
        <h3>Aylık Satış</h3>
        {monthlySales.length === 0 ? (
          <p>Henüz satış verisi yok</p>
        ) : (
          <Bar data={salesChartData} />
        )}
      </div>

      <div>
        <h3>En Çok Satan Ürünler</h3>
        {topProducts.length === 0 ? (
          <p>Henüz sipariş verisi yok</p>
        ) : (
          <Bar data={productsChartData} />
        )}
      </div>
    </div>
  );
}

export default Reports;