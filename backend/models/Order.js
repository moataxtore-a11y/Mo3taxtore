const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    title: String,
    price: Number,
    originalPrice: Number,
    discount: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    coverImage: String,
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        governorate: { type: String, required: true },
        postalCode: String,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    couponCode: String,
    deliveryFee: {
        type: Number,
        default: 30,
    },
    total: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'stripe', 'paymob'],
        default: 'cod',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'placed',
    },
    trackingNumber: String,
    statusHistory: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
    }],
    isArchived: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, isArchived: 1, createdAt: -1 });
orderSchema.index({ isArchived: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);