const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Tüm müşterileri listeler
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Müşteri listesi
 */
router.get('/', authMiddleware, getCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Tek bir müşteriyi getirir
 *     tags: [Customers]
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
 *         description: Müşteri bulundu
 *       404:
 *         description: Müşteri bulunamadı
 */
router.get('/:id', authMiddleware, getCustomerById);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Yeni müşteri ekler
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Müşteri oluşturuldu
 */
router.post('/', authMiddleware, createCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Bir müşteriyi günceller
 *     tags: [Customers]
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
 *         description: Müşteri güncellendi
 */
router.put('/:id', authMiddleware, updateCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Bir müşteriyi siler (sadece admin)
 *     tags: [Customers]
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
 *         description: Müşteri silindi
 *       403:
 *         description: Yetki yok
 */
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCustomer);

module.exports = router;