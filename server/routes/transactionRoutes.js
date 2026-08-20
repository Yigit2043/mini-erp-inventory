const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getTransactions, createTransaction } = require('../controllers/transactionController');

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Bir müşteri veya tedarikçinin hareket geçmişini getirir
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hareket listesi
 */
router.get('/', authMiddleware, getTransactions);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Manuel ödeme/tahsilat veya borç kaydı oluşturur, bakiyeyi otomatik günceller
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               supplier_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [debt, payment]
 *               amount:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hareket oluşturuldu, güncel bakiye döndü
 */
router.post('/', authMiddleware, createTransaction);

module.exports = router;