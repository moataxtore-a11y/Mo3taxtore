const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getAdminAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getAnnouncements);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAdminAnnouncements);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.put('/:id/toggle', toggleAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
