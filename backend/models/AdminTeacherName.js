const mongoose = require('mongoose');

const adminTeacherNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true,
  },
  photo: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AdminTeacherName', adminTeacherNameSchema);
