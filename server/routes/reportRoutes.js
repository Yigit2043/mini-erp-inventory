const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getMonthlySales,
  getTopProducts,
  getBalanceSummary,
  getTopDebtors,
  getReorderSuggestions
} = require('../controllers/reportController');

router.get('/monthly-sales', authMiddleware, getMonthlySales);
router.get('/top-products', authMiddleware, getTopProducts);
router.get('/balance-summary', authMiddleware, getBalanceSummary);
router.get('/top-debtors', authMiddleware, getTopDebtors);
router.get('/reorder-suggestions', authMiddleware, getReorderSuggestions);

module.exports = router;