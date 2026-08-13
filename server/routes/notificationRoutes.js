const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkAndNotify } = require('../controllers/notificationController');

router.post('/check-stock', authMiddleware, checkAndNotify);

module.exports = router;