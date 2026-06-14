const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.resolve('.env.local');
const content = fs.readFileSync(envPath, 'utf8');

// Parse FIREBASE_ADMIN_PRIVATE_KEY line
const lines = content.split('\n');
let privateKeyLine = null;
for (const line of lines) {
  if (line.startsWith('FIREBASE_ADMIN_PRIVATE_KEY=')) {
    privateKeyLine = line.substring('FIREBASE_ADMIN_PRIVATE_KEY='.length);
    break;
  }
}

if (privateKeyLine) {
  // Remove quotes if present
  if (privateKeyLine.startsWith('"') && privateKeyLine.endsWith('"')) {
    privateKeyLine = privateKeyLine.substring(1, privateKeyLine.length - 1);
  }

  console.log('Private key from file:');
  console.log('Length:', privateKeyLine.length);
  console.log('First 100 chars:', JSON.stringify(privateKeyLine.substring(0, 100)));
  console.log('Has\\\\n:', privateKeyLine.includes('\\n')); // Check for literal backslash-n
  console.log('Has newline:', privateKeyLine.includes('\n')); // Check for actual newline

  // Show what happens when we replace \\n with \n
  const replaced = privateKeyLine.replace(/\\n/g, '\n');
  console.log('\\n -> newline replacement:');
  console.log('Length:', replaced.length);
  console.log('First 100 chars:', JSON.stringify(replaced.substring(0, 100)));
  console.log('Last 100 chars:', JSON.stringify(replaced.substring(replaced.length - 100)));
} else {
  console.log('FIREBASE_ADMIN_PRIVATE_KEY not found');
}