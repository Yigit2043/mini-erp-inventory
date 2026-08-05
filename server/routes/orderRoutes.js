const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getOrders, createOrder } = require('../controllers/orderController');

router.get('/', authMiddleware, getOrders);
router.post('/', authMiddleware, createOrder);

module.exports = router;