// test-mongodb.js - Test MongoDB connection
const { testConnection } = require('./lib/db/mongodb.ts');

async function test() {
  console.log('Testing MongoDB connection...');

  try {
    const connected = await testConnection();

    if (connected) {
      console.log('✅ MongoDB connection test PASSED');
      process.exit(0);
    } else {
      console.log('❌ MongoDB connection test FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ MongoDB connection test FAILED with error:', error.message);
    process.exit(1);
  }
}

test();
