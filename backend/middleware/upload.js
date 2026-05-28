const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Book Covers
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'moataxtore/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto:good' }],
  },
});

// Storage for CMS items (Full width, no crop)
const cmsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'moataxtore/cms',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 2500, crop: 'limit', quality: 'auto:good' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 9 * 1024 * 1024 },
});

const cmsUpload = multer({
  storage: cmsStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
});

module.exports = {
  upload,
  cmsUpload,
  cloudinary
};
