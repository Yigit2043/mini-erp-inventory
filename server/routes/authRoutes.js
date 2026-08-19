const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu
 *       400:
 *         description: Geçersiz veri veya email zaten kayıtlı
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Giriş yapar ve JWT token döner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı, token döndü
 *       401:
 *         description: Geçersiz email veya şifre
 */
router.post('/login', authLimiter, login);

module.exports = router;