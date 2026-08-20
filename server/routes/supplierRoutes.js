const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getSuppliers, createSupplier, deleteSupplier } = require('../controllers/supplierController');

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Tüm tedarikçileri listeler
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tedarikçi listesi
 */
router.get('/', authMiddleware, getSuppliers);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Yeni tedarikçi ekler
 *     tags: [Suppliers]
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
 *               contact_person:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tedarikçi oluşturuldu
 */
router.post('/', authMiddleware, createSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Bir tedarikçiyi siler (sadece admin)
 *     tags: [Suppliers]
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
 *         description: Tedarikçi silindi
 *       403:
 *         description: Yetki yok
 */
router.delete('/:id', authMiddleware, requireRole('admin'), deleteSupplier);

module.exports = router;