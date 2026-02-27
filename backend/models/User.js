import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'user'],
      required: true
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    
    // For instructors: who created them
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    
    // Assigned courses (admin manually assigns to users)
    assignedCourses: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Course' 
    }],
    
    // Completed courses
    completedCourses: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Course' 
    }],
    
    // Progress tracking
    progress: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      completedModules: [{ type: mongoose.Schema.Types.ObjectId }],
      lastAccessedAt: { type: Date },
      progressPercent: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
