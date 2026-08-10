const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı boş olamaz'),
  sku: z.string().min(1, 'SKU boş olamaz'),
  price: z.number().positive('Fiyat pozitif olmalı'),
  stock_qty: z.number().int().nonnegative('Stok negatif olamaz').optional(),
  critical_level: z.number().int().nonnegative('Kritik seviye negatif olamaz').optional(),
});

module.exports = { productSchema };