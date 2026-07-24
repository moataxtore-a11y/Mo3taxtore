const Announcement = require('../models/Announcement');

// @desc    Get all active announcements for public
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort('priority');
        res.json({ announcements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all announcements for admin
// @route   GET /api/announcements/admin
exports.getAdminAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort('priority');
        res.json({ announcements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);
        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement) return res.status(404).json({ message: 'Not found' });
        res.json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Toggle announcement status
// @route   PUT /api/announcements/:id/toggle
exports.toggleAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Not found' });
        announcement.isActive = !announcement.isActive;
        await Announcement.findByIdAndUpdate(req.params.id, { isActive: announcement.isActive });
        res.json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
