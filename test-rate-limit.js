const rateLimit = require('./src/lib/rate-limit/index.js');

async function testRateLimit() {
  console.log('Testing rate limiter...');

  // Test the auth limiter
  for (let i = 1; i <= 12; i++) {
    try {
      const result = await rateLimit.checkRateLimit(rateLimit.authLimiter, `test-user-${i % 3}`); // Use 3 different identifiers
      console.log(`Request ${i}: Allowed (remaining: ${result.remaining})`);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        console.log(`Request ${i}: RATE LIMITED - ${error.message}`);
        if (error.headers) {
          console.log(`  Headers:`, error.headers);
        }
      } else {
        console.log(`Request ${i}: Unexpected error:`, error);
      }
    }
  }
}

testRateLimit().catch(console.error);