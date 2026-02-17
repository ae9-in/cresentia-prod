import './loadEnv.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5000;

console.log('✅ Environment loaded');
console.log(`   PORT: ${PORT}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'Set' : 'Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
