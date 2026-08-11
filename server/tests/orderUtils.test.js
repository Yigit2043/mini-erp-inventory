const { calculateTotal, calculateStockChange } = require('../utils/orderUtils');

describe('calculateTotal', () => {
  test('tek ürünün toplamını doğru hesaplar', () => {
    const items = [{ qty: 2, unit_price: 99.90 }];
    expect(calculateTotal(items)).toBe(199.8);
  });

  test('birden fazla ürünün toplamını doğru hesaplar', () => {
    const items = [
      { qty: 2, unit_price: 99.90 },
      { qty: 1, unit_price: 49.90 },
    ];
    expect(calculateTotal(items)).toBe(249.7);
  });

  test('ondalık hassasiyet hatası olmadan yuvarlar', () => {
    const items = [{ qty: 3, unit_price: 99.90 }];
    // 3 * 99.90 = 299.70000000000005 gibi bir JS hatasına düşmemeli
    expect(calculateTotal(items)).toBe(299.7);
  });

  test('boş liste için 0 döner', () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe('calculateStockChange', () => {
  test('satış (sale) stoktan düşürür (negatif değer)', () => {
    expect(calculateStockChange('sale', 5)).toBe(-5);
  });

  test('alım (purchase) stoğa ekler (pozitif değer)', () => {
    expect(calculateStockChange('purchase', 5)).toBe(5);
  });
});