const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole } = require('../controllers/userController');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Tüm kullanıcıları listeler (sadece admin, şifre hariç)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *       403:
 *         description: Yetki yok
 */
router.get('/', authMiddleware, requireRole('admin'), getUsers);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Bir kullanıcının rolünü değiştirir (sadece admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Rol güncellendi
 *       403:
 *         description: Yetki yok
 */
router.put('/:id/role', authMiddleware, requireRole('admin'), updateUserRole);

module.exports = router;