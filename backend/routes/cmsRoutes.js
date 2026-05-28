const express = require('express');
const router = express.Router();
const { getCmsContent, updateCmsContent, getAllCmsContent, getBestSellers } = require('../controllers/cmsController');
const { protect, authorize } = require('../middleware/auth');
const { cmsUpload } = require('../middleware/upload');

// Public routes
router.get('/best-sellers/all', getBestSellers);
router.get('/:key', getCmsContent);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getAllCmsContent);
router.put('/:key', protect, authorize('admin'), cmsUpload.single('image'), updateCmsContent);

module.exports = router;