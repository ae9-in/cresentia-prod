import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Cloudinary video upload endpoint (simplified - just returns the Cloudinary URL)
router.post('/videos', protect, authorizeRoles('admin', 'instructor'), (req, res) => {
  const { cloudinaryUrl } = req.body;

  if (!cloudinaryUrl) {
    return res.status(400).json({
      message: 'Cloudinary URL is required. Please upload your video to Cloudinary and provide the URL.'
    });
  }

  // Validate that it's a Cloudinary URL
  if (!cloudinaryUrl.includes('cloudinary.com')) {
    return res.status(400).json({
      message: 'Please provide a valid Cloudinary URL'
    });
  }

  res.status(201).json({ url: cloudinaryUrl });
});

// Helper endpoint to get Cloudinary upload instructions
router.get('/cloudinary-info', protect, authorizeRoles('admin', 'instructor'), (req, res) => {
  res.json({
    message: 'Video Upload Instructions',
    instructions: [
      '1. Go to https://cloudinary.com/console/media_library',
      '2. Upload your video file to Cloudinary',
      '3. Copy the video URL from Cloudinary',
      '4. Paste the URL in the Cloudinary URL field below',
      '5. Add video title and duration'
    ],
    cloudinaryUrl: 'https://cloudinary.com/console/media_library'
  });
});

export default router;
