const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Robust bcrypt instance fetch for bcryptjs v3+ (CommonJS & ESM compatible)
let bcryptInst;
try {
  bcryptInst = bcrypt.genSalt ? bcrypt : (bcrypt.default || bcrypt);
} catch (e) {
  bcryptInst = bcrypt;
}


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    grade: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    address: {
        street: String,
        city: String,
        governorate: String,
        postalCode: String,
    },
    // Teacher-specific fields
    bio: {
        type: String,
        maxlength: 500,
    },
    subject: {
        type: String,
        trim: true,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcryptInst.genSalt(12);
    this.password = await bcryptInst.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    try {
        return await bcryptInst.compare(candidatePassword, this.password);
    } catch (err) {
        console.error('Password comparison failed:', err);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);