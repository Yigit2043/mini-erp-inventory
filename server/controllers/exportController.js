const ExcelJS = require('exceljs');
const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Tüm ürünleri Excel dosyası olarak dışa aktarır
const exportProducts = asyncHandler(async (req, res) => {
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ürünler');

  sheet.columns = [
    { header: 'Ad', key: 'name', width: 25 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Fiyat', key: 'price', width: 12 },
    { header: 'Stok', key: 'stock_qty', width: 10 },
    { header: 'Kritik Seviye', key: 'critical_level', width: 15 },
  ];

  sheet.getRow(1).font = { bold: true };

  products.forEach((p) => {
    sheet.addRow({
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock_qty: p.stock_qty,
      critical_level: p.critical_level,
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=urunler.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = { exportProducts };