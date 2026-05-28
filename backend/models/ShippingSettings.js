const mongoose = require('mongoose');

const governorateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
});

const shippingSettingsSchema = new mongoose.Schema({
    freeShippingThreshold: {
        type: Number,
        required: true,
        default: 500,
    },
    governorates: [governorateSchema],
}, { timestamps: true });

module.exports = mongoose.model('ShippingSettings', shippingSettingsSchema);