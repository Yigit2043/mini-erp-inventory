const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getSuppliers, createSupplier, deleteSupplier } = require('../controllers/supplierController');

router.get('/', authMiddleware, getSuppliers);
router.post('/', authMiddleware, createSupplier);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteSupplier);

module.exports = router;