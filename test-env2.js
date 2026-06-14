// Test what the env.ts module returns
const env = require('./src/config/env.js');

console.log('FIREBASE_ADMIN_PROJECT_ID:', env.FIREBASE_ADMIN_PROJECT_ID ? 'present' : 'missing');
console.log('FIREBASE_ADMIN_CLIENT_EMAIL:', env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'present' : 'missing');
console.log('FIREBASE_ADMIN_PRIVATE_KEY:', env.FIREBASE_ADMIN_PRIVATE_KEY ? 'present' : 'missing');

if (env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.log('FIREBASE_ADMIN_PRIVATE_KEY length:', env.FIREBASE_ADMIN_PRIVATE_KEY.length);
  console.log('FIREBASE_ADMIN_PRIVATE_KEY starts with:', JSON.stringify(env.FIREBASE_ADMIN_PRIVATE_KEY.substring(0, 30)));
  console.log('FIREBASE_ADMIN_PRIVATE_KEY ends with:', JSON.stringify(env.FIREBASE_ADMIN_PRIVATE_KEY.substring(env.FIREBASE_ADMIN_PRIVATE_KEY.length - 30)));

  // Test the replacement
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
  console.log('Processed PRIVATE_KEY length:', privateKey.length);
  console.log('Processed PRIVATE_KEY starts with:', JSON.stringify(privateKey.substring(0, 30)));
  console.log('Processed PRIVATE_KEY ends with:', JSON.stringify(privateKey.substring(privateKey.length - 30)));
}