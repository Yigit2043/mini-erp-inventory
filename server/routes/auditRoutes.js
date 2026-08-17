const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

router.get('/', authMiddleware, requireRole('admin'), getAuditLogs);

module.exports = router;