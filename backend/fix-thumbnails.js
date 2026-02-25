import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from './models/Course.js';
import './loadEnv.js'; // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper function to generate thumbnail URL
const generateThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
  
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  
  return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
};

const fixThumbnails = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    let updatedCount = 0;

    for (const course of courses) {
      let needsUpdate = false;

      // Fix modules
      if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
          if (module.type === 'video' && module.videoUrl && !module.thumbnailUrl) {
            module.thumbnailUrl = generateThumbnailUrl(module.videoUrl);
            needsUpdate = true;
            console.log(`  - Fixed thumbnail for module: ${module.title}`);
          }
        });
      }

      // Fix legacy videos
      if (course.videos && course.videos.length > 0) {
        course.videos.forEach(video => {
          if (video.url && !video.thumbnailUrl) {
            video.thumbnailUrl = generateThumbnailUrl(video.url);
            needsUpdate = true;
            console.log(`  - Fixed thumbnail for video: ${video.title}`);
          }
        });
      }

      if (needsUpdate) {
        await course.save();
        updatedCount++;
        console.log(`✓ Updated course: ${course.title}`);
      }
    }

    console.log(`\n✅ Fixed thumbnails for ${updatedCount} courses`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing thumbnails:', error);
    process.exit(1);
  }
};

fixThumbnails();
