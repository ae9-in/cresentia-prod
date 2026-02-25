import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const CourseCard = ({ course }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoRef = useRef(null);

  const handleClick = () => {
    console.log('\n========================================');
    console.log('🎯 CourseCard Button Clicked');
    console.log('========================================');
    console.log('📋 Course Title:', course.title);
    console.log('📋 Course ID:', course._id);
    console.log('📋 ID type:', typeof course._id);
    console.log('📋 ID value:', JSON.stringify(course._id));
    console.log('🔗 Navigation Path:', `/courses/${course._id}`);
    console.log('🔗 Full URL will be:', window.location.origin + `/courses/${course._id}`);
    console.log('========================================\n');
  };

  // Validate course data
  if (!course || !course._id) {
    console.error('❌ CourseCard: Invalid course data', course);
    return null;
  }

  // Get thumbnail URL
  const getThumbnailUrl = () => {
    // Priority 1: Course has explicit thumbnail
    if (course.thumbnail) {
      return course.thumbnail;
    }

    // Priority 2: Get from first video module
    if (course.modules && course.modules.length > 0) {
      const videoModule = course.modules.find(m => m.type === 'video' && m.thumbnail);
      if (videoModule?.thumbnail) {
        return videoModule.thumbnail;
      }
    }

    // Priority 3: Get from legacy videos array
    if (course.videos && course.videos.length > 0 && course.videos[0].thumbnail) {
      return course.videos[0].thumbnail;
    }

    // Priority 4: Use category-based placeholder
    return null;
  };

  // Get video URL for thumbnail generation
  const getVideoUrl = () => {
    // Check modules first
    if (course.modules && course.modules.length > 0) {
      const videoModule = course.modules.find(m => m.type === 'video' && m.videoUrl);
      if (videoModule?.videoUrl) {
        return videoModule.videoUrl;
      }
    }

    // Check legacy videos array
    if (course.videos && course.videos.length > 0 && course.videos[0].url) {
      return course.videos[0].url;
    }

    return null;
  };

  // Generate thumbnail from video
  const generateThumbnailFromVideo = (videoUrl) => {
    if (!videoUrl || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Can't generate from YouTube videos
      return;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    video.addEventListener('loadeddata', () => {
      // Seek to random time in first 10 seconds
      const randomTime = Math.random() * Math.min(10, video.duration);
      video.currentTime = randomTime;
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setThumbnail(thumbnailDataUrl);
    });

    video.addEventListener('error', () => {
      setThumbnailError(true);
    });
  };

  // Get placeholder based on category
  const getCategoryPlaceholder = () => {
    const placeholders = {
      'IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=270&fit=crop',
      'Business & Analytics': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=270&fit=crop',
      'Sales & Soft Skills': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=270&fit=crop',
      'AI & ML': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=270&fit=crop'
    };
    return placeholders[course.category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=270&fit=crop';
  };

  useEffect(() => {
    const thumbnailUrl = getThumbnailUrl();
    
    if (thumbnailUrl) {
      setThumbnail(thumbnailUrl);
    } else {
      // Try to generate from video
      const videoUrl = getVideoUrl();
      if (videoUrl && !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        generateThumbnailFromVideo(videoUrl);
      } else {
        // Use category placeholder
        setThumbnail(getCategoryPlaceholder());
      }
    }
  }, [course]);

  const displayThumbnail = thumbnailError ? getCategoryPlaceholder() : (thumbnail || getCategoryPlaceholder());

  return (
    <article className="card course-card">
      <div className="course-thumbnail">
        <img 
          src={displayThumbnail} 
          alt={course.title}
          onError={() => setThumbnailError(true)}
        />
        <div className="chip-overlay">{course.category}</div>
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p className="course-description">{course.description.slice(0, 110)}...</p>
        <div className="meta-row">
          <span className={`level-badge ${course.level?.toLowerCase()}`}>{course.level}</span>
          <span>⏱️ {course.durationMinutes || course.estimatedDuration || 0} mins</span>
          <span>⭐ {course.ratingAverage?.toFixed(1) || '0.0'}</span>
        </div>
        <Link className="primary-btn start-course-btn" to={`/courses/${course._id}`} onClick={handleClick}>
          Start Course →
        </Link>
      </div>
    </article>
  );
};

export default CourseCard;
