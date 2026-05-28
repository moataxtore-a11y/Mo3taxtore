const Book = require('../models/Book');
const path = require('path');

// @desc    Create a new book (Teacher only)
// @route   POST /api/books
exports.createBook = async(req, res) => {
    try {
        const isStore = req.body.isStoreProduct === 'true' || req.body.isStoreProduct === true;

        const bookData = {
            isStoreProduct: isStore,
            title: req.body.title,
            description: req.body.description,
            price: req.body.price ? parseFloat(req.body.price) : 0,
            discount: req.body.discount ? parseFloat(req.body.discount) : 0,
            triggersFreeShipping: req.body.triggersFreeShipping === 'true' || req.body.triggersFreeShipping === true,
            stock: req.body.stock ? parseInt(req.body.stock) : 0,
            pages: (req.body.pages && req.body.pages !== '') ? parseInt(req.body.pages) : undefined,
            category: req.body.category || (isStore ? 'store' : 'other'),
            teacherName: req.body.teacherName || (isStore ? 'متجر معتز' : ''),
            grade: req.body.grade || '',
            isbn: req.body.isbn || '',
        };

        // Only set teacher if it's a book, or if teacher field is not required (optional)
        if (!isStore) {
            bookData.teacher = req.user._id;
        } else {
            // For store products, we can still link to the admin who created it, but the model skips the requirement
            bookData.teacher = req.user._id;
        }

        if (req.file) {
            bookData.coverImage = req.file.path;
        }

        if (req.user.role === 'admin') {
            bookData.status = 'approved';
        }

        const book = await Book.create(bookData);
        res.status(201).json({ book });
    } catch (error) {
        console.error('Create book error:', error);
        if (error.name === 'ValidationError') {
            const messages = error.errors ? Object.values(error.errors).map(val => val.message) : [error.message];
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all approved books (Marketplace)
// @route   GET /api/books
exports.getBooks = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = { status: 'approved' };
        if (req.query.isStoreProduct === 'true') {
            filter.isStoreProduct = true;
        } else {
            filter.isStoreProduct = { $ne: true };
        }

        // Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Grade filter
        if (req.query.grade) {
            filter.grade = req.query.grade;
        }

        // Teacher filter
        if (req.query.teacherName) {
            filter.teacherName = req.query.teacherName;
        }

        // Search
        if (req.query.search && typeof req.query.search === 'string') {
            filter.$text = { $search: req.query.search };
        }

        // Price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            const minP = parseFloat(req.query.minPrice);
            const maxP = parseFloat(req.query.maxPrice);
            if (!isNaN(minP)) filter.price.$gte = minP;
            if (!isNaN(maxP)) filter.price.$lte = maxP;
            // Clean up empty price filters
            if (Object.keys(filter.price).length === 0) delete filter.price;
        }

        // Sort
        let sort = { createdAt: -1 };
        if (req.query.sort === 'price_asc') sort = { price: 1 };
        if (req.query.sort === 'price_desc') sort = { price: -1 };
        if (req.query.sort === 'popular') sort = { totalSold: -1 };
        if (req.query.sort === 'rating') sort = { averageRating: -1 };

        const books = await Book.find(filter)
            .populate('teacher', 'name avatar')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('title coverImage price discount priceAfterDiscount teacher category grade stock isStoreProduct teacherName triggersFreeShipping')
            .lean();

        const total = await Book.countDocuments(filter);

        res.json({
            books,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error('Error in getBooks:', error.stack || error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
exports.getBook = async(req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('teacher', 'name avatar bio subject');

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ book });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update book (Teacher - own books only)
// @route   PUT /api/books/:id
exports.updateBook = async(req, res) => {
    try {
        let book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check ownership (unless admin)
        if (book.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this book' });
        }

        const updates = {...req.body };
        if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
        if (req.body.stock !== undefined) updates.stock = parseInt(req.body.stock);
        if (req.body.pages !== undefined) updates.pages = (req.body.pages && req.body.pages !== '') ? parseInt(req.body.pages) : undefined;

        if (req.body.isStoreProduct !== undefined) {
            updates.isStoreProduct = req.body.isStoreProduct === 'true' || req.body.isStoreProduct === true;
        }
        if (req.body.triggersFreeShipping !== undefined) {
            updates.triggersFreeShipping = req.body.triggersFreeShipping === 'true' || req.body.triggersFreeShipping === true;
        }
        if (req.body.discount !== undefined) updates.discount = parseFloat(req.body.discount);
        if (req.body.totalSold !== undefined) updates.totalSold = parseInt(req.body.totalSold);
        if (req.file) {
            updates.coverImage = req.file.path;
        }

        // If teacher edits, set back to pending for review
        if (req.user.role === 'teacher') {
            updates.status = 'pending';
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            book[key] = updates[key];
        });

        await book.save();

        res.json({ book });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete book (Teacher - own books only)
// @route   DELETE /api/books/:id
exports.deleteBook = async(req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this book' });
        }

        await book.deleteOne();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get teacher's own books
// @route   GET /api/books/my-books
exports.getMyBooks = async(req, res) => {
    try {
        const books = await Book.find({ teacher: req.user._id }).sort({ createdAt: -1 });
        res.json({ books });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get featured/popular books
// @route   GET /api/books/featured
exports.getFeaturedBooks = async(req, res) => {
    try {
        let filter = { status: 'approved' };
        if (req.query.isStoreProduct === 'true') {
            filter.isStoreProduct = true;
        } else {
            filter.isStoreProduct = { $ne: true };
        }
        const featured = await Book.find(filter)
            .populate('teacher', 'name avatar')
            .sort({ totalSold: -1 })
            .limit(8)
            .select('title coverImage price discount priceAfterDiscount teacher category grade stock isStoreProduct teacherName triggersFreeShipping')
            .lean();

        res.json({ books: featured });
    } catch (error) {
        console.error('getFeaturedBooks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};