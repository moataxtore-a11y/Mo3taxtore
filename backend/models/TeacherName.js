const mongoose = require('mongoose');

const teacherNameSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
}, {
    timestamps: true,
});

teacherNameSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('TeacherName', teacherNameSchema);