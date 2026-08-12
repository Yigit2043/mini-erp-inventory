const PDFDocument = require('pdfkit');
const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Bir siparişin PDF faturasını oluşturur ve indirilebilir olarak döner
const generateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    const err = new Error('Sipariş bulunamadı');
    err.statusCode = 404;
    throw err;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(name, sku)')
    .eq('order_id', id);

  if (itemsError) {
    const err = new Error(itemsError.message);
    err.statusCode = 400;
    throw err;
  }

  // PDF dosyasını oluşturmaya başla
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=fatura-${id}.pdf`);

  doc.pipe(res);

  // Başlık
  doc.fontSize(20).text('FATURA', { align: 'center' });
  doc.moveDown();

  // Sipariş bilgileri
  doc.fontSize(12);
  doc.text(`Sipariş No: #${order.id}`);
  doc.text(`Tarih: ${new Date(order.created_at).toLocaleString('tr-TR')}`);
  doc.text(`Tip: ${order.type === 'sale' ? 'Satış' : 'Alım'}`);
  doc.moveDown();

  // Tablo başlığı
  doc.fontSize(12).text('Ürünler:', { underline: true });
  doc.moveDown(0.5);

  items.forEach((item) => {
    const lineTotal = (item.qty * item.unit_price).toFixed(2);
    doc.text(
      `${item.products?.name || 'Ürün'} (${item.products?.sku || '-'})  x${item.qty}  @ ${item.unit_price} ₺  = ${lineTotal} ₺`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Toplam: ${order.total} ₺`, { align: 'right' });

  doc.end();
});

module.exports = { generateInvoice };