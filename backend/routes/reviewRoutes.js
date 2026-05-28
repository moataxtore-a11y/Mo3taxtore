const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { validate, reviewSchema } = require('../middleware/validate');

router.post('/:bookId', protect, authorize('student'), validate(reviewSchema), reviewController.createReview);
router.get('/:bookId', reviewController.getBookReviews);

module.exports = router;
