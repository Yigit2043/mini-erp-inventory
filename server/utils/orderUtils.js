// Sipariş kalemlerinin toplam tutarını hesaplar (2 ondalık basamağa yuvarlanmış)
function calculateTotal(items) {
  const rawTotal = items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  return Math.round(rawTotal * 100) / 100;
}

// Sipariş tipine göre stok değişim miktarını hesaplar
// 'sale' (satış) stoktan düşer, 'purchase' (alım) stoğa ekler
function calculateStockChange(type, qty) {
  return type === 'sale' ? -qty : qty;
}

module.exports = { calculateTotal, calculateStockChange };
