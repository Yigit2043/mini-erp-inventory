const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { productSchema } = require('../schemas/productSchema');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockMovements
} = require('../controllers/productController');

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
 *     responses:
 *       201:
 *         description: Ürün oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', authMiddleware, validate(productSchema), createProduct);

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