const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required']
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function(orderAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'الكوبون غير مفعل' };
  if (now > this.expiryDate) return { valid: false, message: 'الكوبون منتهي الصلاحية' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'وصل الكوبون للحد الأقصى للاستخدام' };
  }
  if (orderAmount < this.minPurchase) {
    return { valid: false, message: `الحد الأدنى لاستخدام الكوبون هو ${this.minPurchase} جنيه` };
  }
  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
