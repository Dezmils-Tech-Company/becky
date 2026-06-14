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

  console.log('=== RAW VALUE FROM .env.local ===');
  console.log('Length:', privateKeyLine.length);

  // Check for actual newline vs escaped newline
  console.log('Contains actual newline (\\n char):', privateKeyLine.includes('\n'));
  console.log('Contains literal backslash-n (\\\\n):', privateKeyLine.includes('\\n'));

  // Show first 50 chars with character codes
  console.log('\\nFirst 50 chars with codes:');
  for (let i = 0; i < Math.min(50, privateKeyLine.length); i++) {
    const char = privateKeyLine[i];
    const code = privateKeyLine.charCodeAt(i);
    process.stdout.write(`${char === '\\n' ? '\\n' : char === '\\' ? '\\\\' : char} (${code}) `);
    if ((i + 1) % 10 === 0) process.stdout.write('\n');
  }
  console.log('\n');

  // Test what happens with different replacements
  console.log('=== TESTING REPLACEMENTS ===');

  // Option 1: Replace literal backslash-n with actual newline
  const replaced1 = privateKeyLine.replace(/\\n/g, '\n');
  console.log('After replace(/\\\\n/g, "\\n"):');
  console.log('  Length:', replaced1.length);
  console.log('  Starts with:', JSON.stringify(replaced1.substring(0, 30)));

  // Option 2: Replace actual newline with actual newline (should be no-op)
  const replaced2 = privateKeyLine.replace(/\n/g, '\n');
  console.log('After replace(/\\n/g, "\\n"):');
  console.log('  Length:', replaced2.length);
  console.log('  Starts with:', JSON.stringify(replaced2.substring(0, 30)));

  // Option 3: No replacement
  console.log('No replacement:');
  console.log('  Length:', privateKeyLine.length);
  console.log('  Starts with:', JSON.stringify(privateKeyLine.substring(0, 30)));
} else {
  console.log('FIREBASE_ADMIN_PRIVATE_KEY not found');
}