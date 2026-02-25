import './loadEnv.js';
import connectDB from './config/db.js';

console.log('🔍 Testing connection stability (5 attempts)...\n');

async function testMultipleConnections() {
  const results = [];
  
  for (let i = 1; i <= 5; i++) {
    const startTime = Date.now();
    try {
      const connected = await connectDB();
      const duration = Date.now() - startTime;
      results.push({ attempt: i, success: connected, duration });
      console.log(`Attempt ${i}: ${connected ? '✅ Success' : '❌ Failed'} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - startTime;
      results.push({ attempt: i, success: false, duration, error: err.message });
      console.log(`Attempt ${i}: ❌ Failed (${duration}ms) - ${err.message}`);
    }
    
    // Wait 1 second between attempts
    if (i < 5) await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successful = results.filter(r => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log('\n📊 Results:');
  console.log(`✅ Successful: ${successful}/5`);
  console.log(`⏱️  Average time: ${avgDuration.toFixed(0)}ms`);
  console.log(`🎯 Success rate: ${(successful/5*100).toFixed(0)}%`);
  
  process.exit(successful === 5 ? 0 : 1);
}

testMultipleConnections();
