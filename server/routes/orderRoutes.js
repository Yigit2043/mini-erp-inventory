const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getOrders, getOrderById, createOrder } = require('../controllers/orderController');
const { generateInvoice } = require('../controllers/invoiceController');

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.get('/:id/invoice', authMiddleware, generateInvoice);
router.post('/', authMiddleware, createOrder);

module.exports = router;