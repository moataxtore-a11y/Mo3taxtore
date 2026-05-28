const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'كود الخصم غير موجود' });
    }

    const { valid, message } = coupon.isValid(orderAmount);
    if (!valid) {
      return res.status(400).json({ message });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountAmount) / 100;
    } else {
      discount = coupon.discountAmount;
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      calculatedDiscount: Math.min(discount, orderAmount),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a coupon (Admin)
// @route   POST /api/admin/coupons
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'كود الخصم موجود بالفعل' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'الكوبون غير موجود' });
    }
    res.json({ message: 'تم حذف الكوبون بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle coupon status (Admin)
// @route   PUT /api/admin/coupons/:id/toggle
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'الكوبون غير موجود' });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
