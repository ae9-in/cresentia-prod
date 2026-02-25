import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: { type: Map, of: Number },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    
    // Legacy video tracking (kept for backward compatibility)
    completedVideos: { type: [Number], default: [] },
    
    // New module tracking
    completedModules: { type: [String], default: [] }, // Array of module IDs
    currentModuleIndex: { type: Number, default: 0 },
    
    // Assessment tracking
    assessmentResults: { type: [assessmentResultSchema], default: [] },
    
    quizScore: { type: Number, default: 0 },
    quizSubmittedAt: { type: Date },
    progressPercent: { type: Number, default: 0 },
    completedAt: { type: Date },
    
    // Performance metrics
    totalPointsEarned: { type: Number, default: 0 },
    averageAssessmentScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
