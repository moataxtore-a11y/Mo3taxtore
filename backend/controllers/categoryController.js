const Category = require('../models/Category');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async(req, res) => {
    try {
        let filter = { isActive: true };
        if (req.query.type === 'book') {
            filter.categoryType = { $ne: 'store' };
        } else if (req.query.type === 'store') {
            filter.categoryType = 'store';
        }
        const categories = await Category.find(filter).sort({ order: 1 }).lean();
        res.json({ success: true, count: categories.length, categories });
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin
// @access  Private/Admin
exports.getAdminCategories = async(req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 }).lean();
        res.json({ success: true, count: categories.length, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async(req, res) => {
    try {
        const { name, slug, icon, color, order, isActive, categoryType } = req.body;
        const category = await Category.create({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            icon,
            color,
            order,
            isActive,
            categoryType: categoryType || 'book'
        });
        res.status(201).json({ success: true, category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async(req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await category.deleteOne();
        res.json({ success: true, message: 'Category removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};