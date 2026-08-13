const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getMonthlySales, getTopProducts } = require('../controllers/reportController');

router.get('/monthly-sales', authMiddleware, getMonthlySales);
router.get('/top-products', authMiddleware, getTopProducts);

module.exports = router;