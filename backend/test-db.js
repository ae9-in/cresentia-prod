import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing connection to:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));

try {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected successfully');
  await mongoose.disconnect();
} catch (err) {
  console.error('❌ Connection failed:');
  console.error(err);
}
process.exit();
