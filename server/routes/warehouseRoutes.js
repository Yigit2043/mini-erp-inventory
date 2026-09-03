const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getWarehouses,
  createWarehouse,
  getWarehouseStock,
  setProductStock,
  getProductStockByWarehouse
} = require('../controllers/warehouseController');

router.get('/', authMiddleware, getWarehouses);
router.post('/', authMiddleware, requireRole('admin'), createWarehouse);
router.get('/:id/stock', authMiddleware, getWarehouseStock);
router.post('/product-stock', authMiddleware, requireRole('admin'), setProductStock);
router.get('/product/:productId/stock', authMiddleware, getProductStockByWarehouse);

module.exports = router;