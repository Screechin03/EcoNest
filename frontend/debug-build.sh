#!/bin/bash
# Simple build script for EcoNest frontend

# Clear any previous build
echo "Cleaning previous build..."
rm -rf dist

# Set environment variables for the build
export VITE_APP_RAZORPAY_KEY_ID=rzp_test_CfHijwdCzAevEK
export VITE_API_URL=https://econest-70qt.onrender.com/api

# Run build
echo "Building project with simple configuration..."
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
  echo "Build successful! Contents of dist directory:"
  ls -la dist
else
  echo "Build failed: dist directory not found"
  exit 1
fi
