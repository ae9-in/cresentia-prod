import './loadEnv.js';
import connectDB, { isConnected } from './config/db.js';

console.log('🔍 Checking database connection...\n');

connectDB()
  .then(connected => {
    if (connected) {
      console.log('\n✅ DATABASE CONNECTION SUCCESSFUL!');
      console.log('✅ Connection is active and ready');
    } else {
      console.log('\n❌ DATABASE CONNECTION FAILED!');
      console.log('❌ Could not establish connection');
    }
    process.exit(connected ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ CONNECTION ERROR:', err.message);
    process.exit(1);
  });
