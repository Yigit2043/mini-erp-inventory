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
import useFetch from '../hooks/useFetch';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const { data: monthlySales, error: salesError } = useFetch('/reports/monthly-sales');
  const { data: topProducts, error: productsError } = useFetch('/reports/top-products');

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

      {(salesError || productsError) && <p style={{ color: 'red' }}>{salesError || productsError}</p>}

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