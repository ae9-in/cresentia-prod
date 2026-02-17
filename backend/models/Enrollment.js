import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedVideos: { type: [Number], default: [] },
    quizScore: { type: Number, default: 0 },
    quizSubmittedAt: { type: Date },
    progressPercent: { type: Number, default: 0 },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
