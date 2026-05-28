const express = require('express');
const router = express.Router();
const { getPublicTeacherNames } = require('../controllers/teacherController');

// Public route to fetch teacher names for filters
router.get('/', getPublicTeacherNames);

module.exports = router;
