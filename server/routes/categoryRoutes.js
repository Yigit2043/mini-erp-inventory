const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Tüm kategorileri listeler
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kategori listesi
 */
router.get('/', authMiddleware, getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Yeni kategori ekler
 *     tags: [Categories]
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
 *     responses:
 *       201:
 *         description: Kategori oluşturuldu
 */
router.post('/', authMiddleware, createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Bir kategoriyi siler (sadece admin)
 *     tags: [Categories]
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
 *         description: Kategori silindi
 *       403:
 *         description: Yetki yok
 */
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategory);

module.exports = router;