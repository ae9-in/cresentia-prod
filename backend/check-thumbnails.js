import mongoose from 'mongoose';
import Course from './models/Course.js';
import './loadEnv.js';

const MONGO_URI = process.env.MONGO_URI;

const checkThumbnails = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const courses = await Course.find({}).select('title videos modules');
    console.log(`Found ${courses.length} courses\n`);

    let coursesWithThumbnails = 0;
    let coursesWithoutThumbnails = 0;

    for (const course of courses) {
      console.log(`📚 Course: ${course.title}`);
      
      // Check legacy videos
      if (course.videos && course.videos.length > 0) {
        course.videos.forEach((video, index) => {
          if (video.thumbnailUrl) {
            console.log(`  ✅ Video ${index + 1}: ${video.title}`);
            console.log(`     Thumbnail: ${video.thumbnailUrl.substring(0, 60)}...`);
            coursesWithThumbnails++;
          } else {
            console.log(`  ❌ Video ${index + 1}: ${video.title} - NO THUMBNAIL`);
            coursesWithoutThumbnails++;
          }
        });
      }
      
      // Check modules
      if (course.modules && course.modules.length > 0) {
        course.modules.forEach((module, index) => {
          if (module.type === 'video') {
            if (module.thumbnailUrl) {
              console.log(`  ✅ Module ${index + 1}: ${module.title}`);
              console.log(`     Thumbnail: ${module.thumbnailUrl.substring(0, 60)}...`);
              coursesWithThumbnails++;
            } else {
              console.log(`  ❌ Module ${index + 1}: ${module.title} - NO THUMBNAIL`);
              coursesWithoutThumbnails++;
            }
          }
        });
      }
      
      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Videos/Modules with thumbnails: ${coursesWithThumbnails}`);
    console.log(`❌ Videos/Modules without thumbnails: ${coursesWithoutThumbnails}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking thumbnails:', error);
    process.exit(1);
  }
};

checkThumbnails();
