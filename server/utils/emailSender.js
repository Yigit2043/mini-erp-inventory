const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail SMTP üzerinden email göndermek için transporter (gönderici) oluşturuyoruz
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kritik stok uyarısı gönderir
async function sendCriticalStockAlert(toEmail, products) {
  const productList = products
    .map((p) => `- ${p.name} (SKU: ${p.sku}) — Stok: ${p.stock_qty}, Kritik Seviye: ${p.critical_level}`)
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '⚠ Kritik Stok Uyarısı - Mini ERP',
    text: `Aşağıdaki ürünler kritik stok seviyesinin altına düştü:\n\n${productList}\n\nLütfen stok durumunu kontrol edin.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Kritik stok uyarı emaili gönderildi');
  } catch (err) {
    console.error('Email gönderilemedi:', err.message);
  }
}

module.exports = { sendCriticalStockAlert };