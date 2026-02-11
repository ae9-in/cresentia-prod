const express = require('express');
const { adminStats, listUsers } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin'), adminStats);
router.get('/users', protect, authorizeRoles('admin'), listUsers);

module.exports = router;
