const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate, orderSchema } = require('../middleware/validate');

router.post('/', protect, validate(orderSchema), orderController.createOrder);
router.get('/', protect, orderController.getMyOrders);
router.get('/teacher', protect, authorize('teacher', 'admin'), orderController.getTeacherOrders);
router.get('/admin/all', protect, authorize('admin'), orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrder);
router.put('/:id/cancel', protect, orderController.cancelOrder);
router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;