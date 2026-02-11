const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'videos'));
  },
  filename: (req, file, cb) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname));
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${safeBase}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  }
});

router.post(
  '/videos',
  protect,
  authorizeRoles('admin', 'instructor'),
  upload.single('video'),
  (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('Video file is required');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/videos/${req.file.filename}`;
    res.status(201).json({ url });
  }
);

module.exports = router;
