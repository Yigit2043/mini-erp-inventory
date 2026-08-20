const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Son 100 işlem kaydını getirir (sadece admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Log kayıtları
 *       403:
 *         description: Yetki yok
 */
router.get('/', authMiddleware, requireRole('admin'), getAuditLogs);

module.exports = router;