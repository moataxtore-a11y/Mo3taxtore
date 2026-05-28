const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    priority: {
        type: Number,
        default: 0,
    },
    displayType: {
        type: String,
        enum: ['marquee', 'static', 'carousel'],
        default: 'static'
    },
    icon: {
        type: String,
        default: 'FiAlertCircle'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Announcement', announcementSchema);
