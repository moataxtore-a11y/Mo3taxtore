const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const { validate, bookSchema } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/featured', bookController.getFeaturedBooks);
router.get('/', bookController.getBooks);
// Teacher and Admin routes
router.post('/', protect, authorize('teacher', 'admin'), upload.single('coverImage'), validate(bookSchema), bookController.createBook);
router.get('/teacher/my-books', protect, authorize('teacher'), bookController.getMyBooks);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('coverImage'), bookController.updateBook);
router.delete('/:id', protect, authorize('teacher', 'admin'), bookController.deleteBook);

// Generic GET for public (must be after specific routes like /teacher/my-books)
router.get('/:id', bookController.getBook);

module.exports = router;
