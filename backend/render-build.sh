#!/usr/bin/env bash
# This is a custom build script for Render.com deployment

# Exit on error
set -o errexit

echo "Running custom build script for EcoNest with Google OAuth support"

# Install dependencies
npm install

# Ensure Google OAuth packages are installed
npm install passport passport-google-oauth20 express-session connect-mongo

# Check if we can create a temporary .env file for testing
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ] && [ -n "$SESSION_SECRET" ]; then
    echo "Environment variables for Google OAuth are set in Render dashboard"
else
    echo "WARNING: Some required environment variables may be missing."
    echo "Make sure to set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and SESSION_SECRET in your Render dashboard."
fi

echo "Build completed successfully!"
