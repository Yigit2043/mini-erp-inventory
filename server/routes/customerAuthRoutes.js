const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { customerLogin, setCustomerPortalAccess } = require('../controllers/customerAuthController');
const { getMyOrders, getMyLedger } = require('../controllers/customerPortalController');

// Müşteri girişi (herkese açık, token gerekmiyor)
router.post('/login', customerLogin);

// Admin'in bir müşteriye portal erişimi ataması
router.put('/:id/portal-access', authMiddleware, requireRole('admin'), setCustomerPortalAccess);

// Müşterinin kendi verilerini görmesi (customer token gerekiyor)
router.get('/my-orders', customerAuthMiddleware, getMyOrders);
router.get('/my-ledger', customerAuthMiddleware, getMyLedger);

module.exports = router;