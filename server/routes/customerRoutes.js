const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

router.get('/', authMiddleware, getCustomers);
router.get('/:id', authMiddleware, getCustomerById);
router.post('/', authMiddleware, createCustomer);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

module.exports = router;