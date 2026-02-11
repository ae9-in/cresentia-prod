const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    durationMinutes: { type: Number, default: 30 }
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true }
  },
  { _id: false }
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
      enum: ['IT', 'Business & Analytics', 'Sales & Soft Skills', 'AI & ML']
    },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videos: { type: [videoSchema], default: [] },
    quizQuestions: { type: [quizQuestionSchema], default: [] },
    durationMinutes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviews: { type: [reviewSchema], default: [] },
    ratingAverage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
