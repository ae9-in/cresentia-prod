import mongoose from 'mongoose';

let cachedConnection = null;
let connectionError = null;
let connectionAttempts = 0;

const connectDB = async (retryCount = 0) => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return true;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ Connection already in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mongoose.connection.readyState === 1;
  }

  connectionAttempts++;
  
  try {
    if (!process.env.MONGO_URI || typeof process.env.MONGO_URI !== 'string') {
      connectionError = 'MONGO_URI is missing or invalid';
      console.warn('⚠️  MONGO_URI is missing or invalid in environment variables');
      return false;
    }
    
    // Log connection attempt (without password)
    const sanitizedUri = process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@');
    console.log(`🔄 MongoDB connection attempt #${connectionAttempts} to: ${sanitizedUri}`);
    console.log(`🔄 Started at: ${new Date().toISOString()}`);
    
    const startTime = Date.now();
    
    // Optimized for serverless with connection pooling
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increased to 30s for better stability
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10, // Increased pool size for better connection reuse
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
      autoIndex: false,
      heartbeatFrequencyMS: 10000, // Check connection health every 10s
      family: 4, // Use IPv4, skip IPv6 for faster connection
    });
    
    const duration = Date.now() - startTime;
    cachedConnection = conn;
    connectionError = null;
    console.log(`✅ MongoDB connected: ${conn.connection.host} (took ${duration}ms)`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Connection state: ${mongoose.connection.readyState}`);
    return true;
  } catch (error) {
    cachedConnection = null;
    connectionError = `${error.name}: ${error.message}`;
    console.error(`❌ MongoDB connection error (attempt #${connectionAttempts}): ${error.message}`);
    console.error(`❌ Error name: ${error.name}`);
    console.error(`❌ Error code: ${error.code}`);
    
    if (error.reason) {
      console.error(`❌ Error reason:`, JSON.stringify(error.reason, null, 2));
    }
    
    // Single retry for serverless
    if (retryCount < 1) {
      console.log(`🔄 Retrying connection immediately... (retry ${retryCount + 1}/1)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return connectDB(retryCount + 1);
    }
    
    return false;
  }
};

// Export connection status
export const isConnected = () => cachedConnection && mongoose.connection.readyState === 1;
export { connectionError };
export default connectDB;
