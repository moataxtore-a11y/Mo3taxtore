const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['about-us', 'faq', 'footer-settings'],
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('CmsContent', cmsSchema);
