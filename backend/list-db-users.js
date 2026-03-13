import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  role: String
}));

const MONGO_URI = process.env.MONGO_URI;

console.log('Checking users in:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));

try {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({}, 'email role');
  console.log('Found users:', users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  await mongoose.disconnect();
} catch (err) {
  console.error('❌ Error:', err.message);
}
process.exit();
