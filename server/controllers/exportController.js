const ExcelJS = require('exceljs');
const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');

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

// Excel dosyasından toplu ürün içe aktarır
const importProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('Excel dosyası yüklenmedi');
    err.statusCode = 400;
    throw err;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.worksheets[0];

  const productsToInsert = [];
  const errors = [];

  // İlk satır başlık olduğu için 2. satırdan başlıyoruz
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // başlık satırını atla

    const name = row.getCell(1).value;
    const sku = row.getCell(2).value;
    const price = row.getCell(3).value;
    const stock_qty = row.getCell(4).value;
    const critical_level = row.getCell(5).value;

    if (!name || !sku || !price) {
      errors.push(`Satır ${rowNumber}: name, sku ve price zorunlu, atlandı`);
      return;
    }

    productsToInsert.push({
      name: String(name),
      sku: String(sku),
      price: Number(price),
      stock_qty: stock_qty ? Number(stock_qty) : 0,
      critical_level: critical_level ? Number(critical_level) : 5,
    });
  });

  if (productsToInsert.length === 0) {
    const err = new Error('Geçerli ürün satırı bulunamadı');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase.from('products').insert(productsToInsert).select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'create', 'product', null, `${data.length} ürün toplu içe aktarıldı`);

  res.status(201).json({
    message: `${data.length} ürün başarıyla eklendi`,
    imported: data.length,
    errors,
  });
});

module.exports = { exportProducts, importProducts };