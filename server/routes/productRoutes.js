const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { productSchema } = require('../schemas/productSchema');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockMovements,
  getProductByBarcode
} = require('../controllers/productController');
const { exportProducts, importProducts } = require('../controllers/exportController');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Tüm ürünleri listeler
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ürün listesi başarıyla döndü
 *       401:
 *         description: Giriş yapılmamış
 */
router.get('/', authMiddleware, getProducts);

/**
 * @swagger
 * /products/export:
 *   get:
 *     summary: Tüm ürünleri Excel dosyası olarak dışa aktarır
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel dosyası (xlsx) döner
 */
router.get('/export', authMiddleware, exportProducts);

/**
 * @swagger
 * /products/import:
 *   post:
 *     summary: Excel dosyasından toplu ürün içe aktarır (sadece admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Ürünler başarıyla içe aktarıldı
 *       403:
 *         description: Yetki yok
 */
router.post('/import', authMiddleware, requireRole('admin'), upload.single('file'), importProducts);

/**
 * @swagger
 * /products/barcode/{barcode}:
 *   get:
 *     summary: Barkod ile ürün arar
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ürün bulundu
 *       404:
 *         description: Bu barkoda ait ürün bulunamadı
 */
router.get('/barcode/:barcode', authMiddleware, getProductByBarcode);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Tek bir ürünü ID ile getirir
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün bulundu
 *       404:
 *         description: Ürün bulunamadı
 */
router.get('/:id', authMiddleware, getProductById);

/**
 * @swagger
 * /products/{id}/movements:
 *   get:
 *     summary: Bir ürünün stok hareket geçmişini getirir
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hareket geçmişi
 */
router.get('/:id/movements', authMiddleware, getStockMovements);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Yeni ürün ekler
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, price]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_qty:
 *                 type: integer
 *               critical_level:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               barcode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ürün oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', authMiddleware, validate(productSchema), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Bir ürünü günceller
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün güncellendi
 */
router.put('/:id', authMiddleware, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Bir ürünü siler (sadece admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün silindi
 *       403:
 *         description: Yetki yok
 */
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProduct);

module.exports = router;