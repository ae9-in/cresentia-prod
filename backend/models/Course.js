import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true, 
      enum: ['video', 'theory', 'assessment', 'case-study', 'scenario'] 
    },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    
    // For video modules
    videoUrl: { type: String },
    thumbnailUrl: { type: String }, // NEW: Thumbnail for video preview
    durationMinutes: { type: Number },
    
    // For theory modules
    content: { type: String },
    conceptExplanation: { type: String },
    keyTakeaways: { type: [String], default: [] },
    
    // For assessment modules
    questions: [{
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: Number, required: true },
      difficulty: { 
        type: String, 
        enum: ['easy', 'medium', 'hard'], 
        default: 'medium' 
      },
      questionType: {
        type: String,
        enum: ['concept', 'application', 'reasoning', 'scenario'],
        default: 'concept'
      },
      explanation: { type: String }, // Shown after submission
      points: { type: Number, default: 1 }
    }],
    timeLimit: { type: Number, default: 15 }, // minutes
    passingScore: { type: Number, default: 70 }, // percentage
    
    // For case study modules
    caseStudyContent: { type: String },
    analysisQuestions: { type: [String], default: [] },
    
    // For scenario modules
    scenarioDescription: { type: String },
    reflectionPrompts: { type: [String], default: [] }
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'Auth Concepts',
        'Website Content',
        'Business Analysis',
        'API Development',
        'Backend Basics',
        'Machine Learning',
        'Conversion Optimization',
        'Web Development'
      ]
    },
    level: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Advanced'], 
      default: 'Beginner' 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    instructorName: { type: String, default: 'Cresantia' },
    
    // Publishing control
    isPublished: { type: Boolean, default: true },
    
    // Advanced course metadata
    learningOutcomes: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    targetAudience: { type: String },
    estimatedDuration: { type: Number }, // in hours
    difficultyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    
    // Course structure
    modules: { type: [moduleSchema], default: [] },
    
    // Category-specific settings
    courseTemplate: {
      type: String,
      enum: ['tech', 'management', 'soft-skills', 'default'],
      default: 'default'
    },
    
    // Legacy fields (kept for backward compatibility)
    videos: { 
      type: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        durationMinutes: { type: Number, default: 30 },
        thumbnailUrl: { type: String } // NEW: Thumbnail for video preview
      }], 
      default: [] 
    },
    quizQuestions: { 
      type: [{
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: Number, required: true }
      }], 
      default: [] 
    },
    
    durationMinutes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    studentsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track assigned students
    reviews: { type: [reviewSchema], default: [] },
    ratingAverage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Virtual for total points in course
courseSchema.virtual('totalPoints').get(function() {
  return this.modules.reduce((total, module) => {
    if (module.questions && module.questions.length > 0) {
      return total + module.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }
    return total;
  }, 0);
});

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
  
  // Try to extract YouTube ID and generate thumbnail
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  
  // For non-YouTube videos, use a default placeholder
  return 'https://via.placeholder.com/480x360/1E3A8A/ffffff?text=Video+Module';
};

// Pre-save hook to auto-generate thumbnails for video modules
courseSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.modules.forEach(module => {
      if (module.type === 'video' && module.videoUrl && !module.thumbnailUrl) {
        module.thumbnailUrl = generateThumbnailUrl(module.videoUrl);
      }
    });
  }
  
  // Also handle legacy videos array
  if (this.videos && this.videos.length > 0) {
    this.videos.forEach(video => {
      if (video.url && !video.thumbnailUrl) {
        video.thumbnailUrl = generateThumbnailUrl(video.url);
      }
    });
  }
  
  next();
});

export default mongoose.model('Course', courseSchema);
