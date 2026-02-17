import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import app from './app.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// For Vercel serverless
if (process.env.VERCEL) {
  // Export app for serverless
  export default app;
} else {
  // Traditional server for local development
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
