#!/bin/bash

# Change to the backend directory
cd backend

# Install dependencies if they're not already installed
npm install

# Run the environment verification script
echo "Running environment variable verification..."
node verify-env.js

# Echo instructions
echo ""
echo "If any required variables are missing, add them to your render.com environment variables."
echo "For Google OAuth, make sure you have set:"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET"
echo "- SESSION_SECRET"
echo ""
echo "You can add these in the render.com dashboard under Environment."
