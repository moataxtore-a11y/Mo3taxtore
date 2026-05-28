const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create review for a book
// @route   POST /api/reviews/:bookId
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user has purchased this book
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.book': req.params.bookId,
      orderStatus: { $in: ['delivered'] },
    });

    if (!hasPurchased) {
      return res.status(400).json({
        message: 'You can only review books you have purchased and received',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: req.params.bookId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      book: req.params.bookId,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a book
// @route   GET /api/reviews/:bookId
exports.getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
