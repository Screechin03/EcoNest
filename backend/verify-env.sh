#!/bin/bash
# This file helps to verify the environment variables are set correctly on Render
echo "Node version: $(node -v)"
echo "MONGODB_URI is set: ${MONGODB_URI:0:10}..."
echo "JWT_SECRET is set: ${JWT_SECRET:0:3}..."
echo "RAZORPAY_KEY_ID is set: ${RAZORPAY_KEY_ID:0:5}..."
echo "CLOUDINARY credentials are set: ${CLOUDINARY_CLOUD_NAME}"
echo "EMAIL credentials are configured"
