import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  role: String
}));

const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  completedVideos: [Number],
  progressPercent: Number
}));

const MONGO_URI = process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOne({ email: 'admin@gmail.com' });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User ID:', user._id);
    const enrollments = await Enrollment.find({ student: user._id });
    console.log('Enrollments found:', enrollments.length);
    enrollments.forEach(e => {
        console.log(`- Course: ${e.course}, Completed: [${e.completedVideos}], Progress: ${e.progressPercent}%`);
    });
  }
  await mongoose.disconnect();
} catch (err) {
  console.error('❌ Error:', err.message);
}
process.exit();
