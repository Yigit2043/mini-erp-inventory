const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole } = require('../controllers/userController');

router.get('/', authMiddleware, requireRole('admin'), getUsers);
router.put('/:id/role', authMiddleware, requireRole('admin'), updateUserRole);

module.exports = router;