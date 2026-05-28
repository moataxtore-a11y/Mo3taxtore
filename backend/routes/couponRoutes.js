const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Public route to validate coupon during checkout
router.post('/validate', protect, couponController.validateCoupon);

// Admin CRUD routes
router.get('/admin', protect, authorize('admin'), couponController.getCoupons);
router.post('/admin', protect, authorize('admin'), couponController.createCoupon);
router.delete('/admin/:id', protect, authorize('admin'), couponController.deleteCoupon);
router.put('/admin/:id/toggle', protect, authorize('admin'), couponController.toggleCouponStatus);

module.exports = router;
