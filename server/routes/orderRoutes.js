const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getOrders, getOrderById, createOrder } = require('../controllers/orderController');
const { generateInvoice } = require('../controllers/invoiceController');

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Tüm siparişleri listeler
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sipariş listesi
 */
router.get('/', authMiddleware, getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Bir siparişi ve içindeki ürünleri getirir
 *     tags: [Orders]
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
 *         description: Sipariş detayı
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get('/:id', authMiddleware, getOrderById);

router.get('/:id/invoice', authMiddleware, generateInvoice);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Yeni sipariş oluşturur ve stoğu otomatik günceller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, items]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [sale, purchase]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     qty:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', authMiddleware, createOrder);

module.exports = router;