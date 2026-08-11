const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, createCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategory);

module.exports = router;
