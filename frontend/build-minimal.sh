#!/bin/bash
# Build with minimal Vite config
echo "Building with minimal configuration..."
export VITE_APP_RAZORPAY_KEY_ID=rzp_test_CfHijwdCzAevEK
export VITE_API_URL=https://econest-70qt.onrender.com/api

# Use the minimal config
npx vite build --config vite.config.minimal.js

if [ -d "dist" ]; then
  echo "Build successful with minimal config!"
  ls -la dist
else
  echo "Build failed even with minimal config"
  exit 1
fi
