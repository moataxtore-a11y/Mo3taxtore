const AdminTeacherName = require('../models/AdminTeacherName');

// @desc    Get all active teacher names
// @route   GET /api/teachers
// @access  Public
exports.getPublicTeacherNames = async (req, res) => {
    try {
        const items = await AdminTeacherName.find({}).sort({ name: 1 }).select('name photo').lean();
        res.json({ success: true, count: items.length, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
