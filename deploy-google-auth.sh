#!/bin/bash

# Deploy script for Render.com with Google OAuth support

# Print header
echo "=============================="
echo "EcoNest Deployment Helper"
echo "=============================="

echo "Starting deployment checks..."

# Check for dotenv package
if ! grep -q "dotenv" package.json; then
  echo "Adding dotenv package..."
  npm install dotenv
fi

# Check for connect-mongo package
if ! grep -q "connect-mongo" package.json; then
  echo "Adding connect-mongo package..."
  npm install connect-mongo
fi

# Check for passport packages
if ! grep -q "passport-google-oauth20" package.json; then
  echo "Adding passport-google-oauth20 package..."
  npm install passport passport-google-oauth20 express-session
fi

echo "Verifying environment variables..."

# Create a temporary script to check environment variables
cat > verify-deploy-env.js << 'EOL'
// Check for environment variables
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET',
  'MONGODB_URI',
  'JWT_SECRET'
];

let missing = [];
for (const v of requiredVars) {
  if (!process.env[v]) {
    missing.push(v);
  }
}

if (missing.length > 0) {
  console.error('⚠️ Missing required environment variables:');
  missing.forEach(v => console.error(`- ${v}`));
  console.error('\nMake sure to add these in your Render.com dashboard under Environment.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
  process.exit(0);
}
EOL

# Run the environment check
if node verify-deploy-env.js; then
  echo "Environment variables look good!"
else
  echo "Please check your environment variables on Render.com"
fi

# Clean up
rm verify-deploy-env.js

echo "Starting server..."
npm start
