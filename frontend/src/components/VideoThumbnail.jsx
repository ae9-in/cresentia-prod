import { useState, useMemo } from 'react';

const VideoThumbnail = ({ module, onClick, isCompleted, isCurrent, isLocked }) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract YouTube ID and generate thumbnail
  const generateThumbnail = (videoUrl) => {
    if (!videoUrl) return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
    
    // Try to extract YouTube ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    // For non-YouTube videos, use a branded placeholder
    return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
  };
  
  // Memoize thumbnail URL generation
  const thumbnailUrl = useMemo(() => {
    if (imageError) {
      return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
    }
    
    // Use provided thumbnail or generate from video URL
    return module.thumbnailUrl || generateThumbnail(module.videoUrl);
  }, [module.thumbnailUrl, module.videoUrl, imageError]);

  return (
    <div
      className={`
        relative group cursor-pointer overflow-hidden rounded-xl shadow-md
        transition-all duration-300 hover:shadow-xl
        ${!isLocked ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}
        ${isCurrent ? 'ring-4 ring-brand ring-opacity-50' : ''}
      `}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Thumbnail Image */}
      <div className="relative aspect-video bg-gray-900">
        <img
          src={thumbnailUrl}
          alt={module.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />
        
        {/* Play Icon */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg
                className="w-8 h-8 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Lock Icon for Locked Modules */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-800 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Completed
          </div>
        )}
        
        {/* Duration Badge */}
        {module.durationMinutes && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-semibold">
            {module.durationMinutes} min
          </div>
        )}
      </div>
      
      {/* Module Info */}
      <div className="p-4 bg-white dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
          {module.title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="capitalize">{module.type}</span>
          {isLocked && <span className="text-yellow-600">• Locked</span>}
          {isCurrent && <span className="text-brand">• Current</span>}
        </div>
      </div>
    </div>
  );
};

export default VideoThumbnail;
