const TeacherName = require('../models/TeacherName');

// @desc    Get teacher names list (owner = logged in teacher)
// @route   GET /api/teacher-names
// @access  Teacher
exports.getTeacherNames = async(req, res) => {
    try {
        const items = await TeacherName.find({ owner: req.user._id })
            .sort({ name: 1 })
            .select('name');

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a teacher name
// @route   POST /api/teacher-names
// @access  Teacher
exports.createTeacherName = async(req, res) => {
    try {
        const name = (req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const item = await TeacherName.create({ owner: req.user._id, name });
        res.status(201).json({ item });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Name already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a teacher name
// @route   DELETE /api/teacher-names/:id
// @access  Teacher
exports.deleteTeacherName = async(req, res) => {
    try {
        const item = await TeacherName.findOne({ _id: req.params.id, owner: req.user._id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};