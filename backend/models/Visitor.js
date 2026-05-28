const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    identifier: {
        type: String, // Can be session ID or hashed IP
        required: true,
        unique: true,
    },
    lastActive: {
        type: Date,
        default: Date.now,
        index: { expires: '15m' } // Automatically delete if inactive for 15 minutes
    },
    isUser: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Visitor', visitorSchema);
