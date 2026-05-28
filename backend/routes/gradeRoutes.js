const express = require('express');
const router = express.Router();
const { getGrades, getAllGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');


// Public
router.get('/', getGrades);

// Admin only
router.get('/admin', protect, authorize('admin'), getAllGrades);
router.post('/admin', protect, authorize('admin'), createGrade);
router.put('/admin/:id', protect, authorize('admin'), updateGrade);
router.delete('/admin/:id', protect, authorize('admin'), deleteGrade);


module.exports = router;

