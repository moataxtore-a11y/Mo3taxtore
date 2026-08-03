const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));


router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.get('/users/:id', adminController.getUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/books', adminController.getAllBooks);
router.post('/books/discount', adminController.applyDiscount);
router.put('/books/:id/approve', adminController.approveBook);
router.get('/orders/pending-count', adminController.getPendingOrdersCount);
router.get('/orders', adminController.getAllOrders);
router.get('/teacher-names', adminController.getTeacherNames);
router.post('/teacher-names', upload.single('photo'), adminController.createTeacherName);
router.put('/teacher-names/:id', upload.single('photo'), adminController.updateTeacherName);
router.delete('/teacher-names/:id', adminController.deleteTeacherName);
router.delete('/reset-stats', adminController.resetAllStats);
router.delete('/orders/:id', adminController.deleteOrder);
router.post('/orders/bulk-delete', adminController.bulkDeleteOrders);

module.exports = router;