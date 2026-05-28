const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        maxlength: 2000,
        default: '',
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100, // discount percentage
    },
    priceAfterDiscount: {
        type: Number,
    },
    coverImage: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: [function() { return !this.isStoreProduct; }, 'Category is required'],
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [function() { return !this.isStoreProduct; }, 'Teacher is required'],
    },
    teacherName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    isbn: {
        type: String,
        trim: true,
    },
    pages: {
        type: Number,
        min: 1,
    },
    grade: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    totalSold: {
        type: Number,
        default: 0,
    },
    isStoreProduct: {
        type: Boolean,
        default: false,
    },
    triggersFreeShipping: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

bookSchema.pre('save', async function() {
    if (this.isModified('price') || this.isModified('discount')) {
        if (this.discount > 0) {
            this.priceAfterDiscount = Math.round(this.price - (this.price * (this.discount / 100)));
        } else {
            this.priceAfterDiscount = this.price; 
        }
    }
});

bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ teacher: 1 });
// Added high-impact sorting indexes
bookSchema.index({ status: 1, createdAt: -1 });
bookSchema.index({ status: 1, price: 1 });
bookSchema.index({ status: 1, totalSold: -1 });

module.exports = mongoose.model('Book', bookSchema);