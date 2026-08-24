import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  const startScan = async () => {
    setError('');
    setProduct(null);
    setScanning(true);

    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          fetchProduct(decodedText);
        },
        () => {} // okuma denemesi başarısız olursa (her karede çağrılır, sessiz geçiyoruz)
      );
    } catch (err) {
      setError('Kamera açılamadı, izin verdiğinizden emin olun');
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  };

  const fetchProduct = async (code) => {
    try {
      const res = await api.get(`/products/barcode/${code}`);
      setProduct(res.data);
    } catch (err) {
      setError(`"${code}" koduna ait ürün bulunamadı`);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <Link to="/dashboard">← Dashboard'a dön</Link>
      <h2>Barkod / QR Tara</h2>

      {!scanning && (
        <button onClick={startScan} style={{ marginBottom: '15px' }}>
          📷 Taramayı Başlat
        </button>
      )}
      {scanning && (
        <button onClick={stopScan} style={{ marginBottom: '15px' }}>
          Durdur
        </button>
      )}

      <div id="reader" style={{ width: '100%' }}></div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {product && (
        <div style={{
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          <h3>{product.name}</h3>
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>Fiyat:</strong> {product.price} ₺</p>
          <p><strong>Stok:</strong> {product.stock_qty}</p>
          <Link to="/products">Ürünler sayfasına git</Link>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;