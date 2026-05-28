const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: 100,
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        trim: true,
        unique: true,
        lowercase: true,
    },
    icon: {
        type: String,
        default: 'FaBook', // Default icon name
    },
    color: {
        type: String,
        default: '#31605F',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    categoryType: {
        type: String,
        enum: ['book', 'store'],
        default: 'book'
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
