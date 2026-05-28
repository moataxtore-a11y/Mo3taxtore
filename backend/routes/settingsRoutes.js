const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// Public route to get shipping settings
router.get('/shipping', settingsController.getShippingSettings);

// Admin route to update shipping settings
router.put('/shipping', protect, authorize('admin'), settingsController.updateShippingSettings);

module.exports = router;
