const Grade = require('../models/Grade');

// @desc    Get all grades
// @route   GET /api/grades
exports.getGrades = async (req, res) => {
    try {
        const grades = await Grade.find({ isActive: true }).sort({ order: 1 });
        res.json({ grades });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all grades for admin
// @route   GET /api/admin/grades
exports.getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find({}).sort({ order: 1 });
        res.json({ grades });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a grade
// @route   POST /api/admin/grades
exports.createGrade = async (req, res) => {
    try {
        const { name, order, isActive } = req.body;
        const grade = await Grade.create({ name, order, isActive });
        res.status(201).json({ grade });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'هذا الصف موجود بالفعل' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a grade
// @route   PUT /api/admin/grades/:id
exports.updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        res.json({ grade });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/admin/grades/:id
exports.deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        await grade.deleteOne();
        res.json({ message: 'Grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
