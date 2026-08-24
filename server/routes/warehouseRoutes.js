const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getWarehouses,
  createWarehouse,
  getWarehouseStock,
  setProductStock,
  getProductStockByWarehouse
} = require('../controllers/warehouseController');

/**
 * @swagger
 * /warehouses:
 *   get:
 *     summary: Tüm depoları listeler
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depo listesi
 */
router.get('/', authMiddleware, getWarehouses);

/**
 * @swagger
 * /warehouses:
 *   post:
 *     summary: Yeni depo ekler
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Depo oluşturuldu
 */
router.post('/', authMiddleware, requireRole('admin'), createWarehouse);

/**
 * @swagger
 * /warehouses/{id}/stock:
 *   get:
 *     summary: Bir deponun içindeki tüm ürün stoklarını getirir
 *     tags: [Warehouses]
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
 *         description: Depo stok listesi
 */
router.get('/:id/stock', authMiddleware, getWarehouseStock);

/**
 * @swagger
 * /warehouses/product-stock:
 *   post:
 *     summary: Bir ürünün belirli bir depodaki stok miktarını ayarlar
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, warehouse_id, stock_qty]
 *             properties:
 *               product_id:
 *                 type: integer
 *               warehouse_id:
 *                 type: integer
 *               stock_qty:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stok ayarlandı
 */
router.post('/product-stock', authMiddleware, setProductStock);

/**
 * @swagger
 * /warehouses/product/{productId}/stock:
 *   get:
 *     summary: Bir ürünün tüm depolardaki stok dağılımını getirir
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürünün depo bazlı stok dağılımı
 */
router.get('/product/:productId/stock', authMiddleware, getProductStockByWarehouse);

module.exports = router;