import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || typeof process.env.MONGO_URI !== 'string') {
      console.warn('⚠️  MONGO_URI is missing or invalid in environment variables');
      return;
    }
    
    // Check if already connected (for serverless)
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't throw - let the app continue without DB
  }
};

export default connectDB;
