const express = require('express');
const router = express.Router();
const { getCategories, getAdminCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getCategories);

// Admin-only routes
router.use(protect, authorize('admin'));
router.get('/admin', getAdminCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
