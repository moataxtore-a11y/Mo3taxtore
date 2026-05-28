const express = require('express');
const router = express.Router();
const teacherNameController = require('../controllers/teacherNameController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('teacher'));

router.get('/', teacherNameController.getTeacherNames);
router.post('/', teacherNameController.createTeacherName);
router.delete('/:id', teacherNameController.deleteTeacherName);

module.exports = router;