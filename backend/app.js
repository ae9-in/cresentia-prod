import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import connectDB, { isConnected, connectionError } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Connect to database on startup (non-blocking for serverless)
let dbConnected = false;
connectDB().then(connected => {
  dbConnected = connected;
  if (connected) {
    console.log('✅ Database ready for requests');
  } else {
    console.warn('⚠️  Database connection failed - some features may not work');
  }
}).catch(err => {
  console.error('⚠️  DB connection failed:', err.message);
});

// Middleware to ensure DB connection before processing requests
app.use(async (req, res, next) => {
  // Skip health check
  if (req.path === '/api/health') {
    return next();
  }
  
  // Check if connected
  if (isConnected()) {
    return next();
  }
  
  // Try to connect if not connected
  console.log('⚠️  No active connection, attempting to connect...');
  const connected = await connectDB();
  
  if (!connected) {
    return res.status(503).json({ 
      message: 'Database connection not available. Please try again in a moment.',
      error: connectionError || 'Connection timeout'
    });
  }
  
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://frontend-sepia-pi-54.vercel.app',
  'https://cresentia-prod-fro.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Crescentia API',
    database: isConnected() ? 'connected' : 'disconnected',
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing',
    lastError: connectionError || 'none'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
