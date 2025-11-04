// test-env.js - Test environment variables
// Next.js automatically loads .env.local, but for this test we'll check manually
const fs = require('fs');
const path = require('path');

// Load .env.local manually for testing
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const requiredVars = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'OPENAI_API_KEY',
  'OPENROUTER_API_KEY',
  'ADMIN_SECRET',
];

const optionalVars = [
  'GITHUB_TOKEN',
  'GITHUB_USERNAME',
  'CRON_SECRET',
  'EMBEDDING_MODEL',
  'LLM_MODEL',
];

console.log('🔍 Checking environment variables...\n');

let allRequired = true;

console.log('Required variables:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    const displayValue = value.length > 20
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    allRequired = false;
  }
}

console.log('\nOptional variables:');
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value) {
    const displayValue = value.length > 20
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (optional)`);
  }
}

if (allRequired) {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
} else {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('Please update .env.local with the missing values.');
  process.exit(1);
}
