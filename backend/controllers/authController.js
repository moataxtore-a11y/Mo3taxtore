const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Visitor = require('../models/Visitor');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async(req, res) => {
    try {
        const { name, password, role, phone, grade } = req.body;

        // SECURITY: Never allow admin registration via public API
        const safeRole = (role === 'teacher') ? 'teacher' : 'student';

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'هذا الرقم مسجل بالفعل' });
        }

        const user = await User.create({ name, password, role: safeRole, phone, grade });

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = field === 'phone' ? 'هذا الرقم مسجل بالفعل' : 
                          field === 'email' ? 'هذا البريد الإلكتروني مسجل بالفعل' :
                          'قيمة مكررة في قاعدة البيانات';
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async(req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة السر غير صحيحة' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة السر غير صحيحة' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Track real-time activity
// @route   POST /api/auth/heartbeat
exports.heartbeat = async(req, res) => {
    try {
        const { identifier, isUser, role } = req.body;
        if (!identifier) return res.status(400).end();

        // If it's an admin, don't count them as an "active visitor" for the movement stats
        if (role === 'admin') {
            return res.status(200).json({ status: 'admin_ignored' });
        }

        // Upsert visitor record
        await Visitor.findOneAndUpdate(
            { identifier },
            { lastActive: new Date(), isUser: !!isUser },
            { upsert: true, new: true }
        );

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).end();
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        // In production, send email/SMS with reset link
        // SECURITY: Never expose the token in the API response
        res.json({
            message: 'تم إرسال رابط إعادة تعيين كلمة السر',
            ...(process.env.NODE_ENV !== 'production' && { resetToken }), // Dev only
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async(req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({ token, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async(req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'bio', 'subject', 'address'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (req.file) {
            updates.avatar = req.file.path;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};