#!/bin/bash
# filepath: /Users/screechin_03/EcoNest/deploy-render.sh

# This script deploys both backend and frontend to Render with proper SPA routing configuration
# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Boulevard Render Deployment Helper =====${NC}"
echo -e "This script will help deploy your application to Render with proper SPA routing"

# Step 1: Build frontend with special Render configuration
echo -e "\n${YELLOW}Step 1: Building frontend optimized for Render${NC}"
cd frontend
./build-for-render.sh

# Step 2: Push changes to Git
echo -e "\n${YELLOW}Step 2: Committing and pushing changes${NC}"
cd ..
git add .
git commit -m "Update deployment configuration for Render with SPA routing fixes"
git push

# Step 3: Instruct user to deploy backend
echo -e "\n${YELLOW}Step 3: Deploy backend service${NC}"
echo "Please go to https://dashboard.render.com and manually deploy your backend service."
echo "1. Navigate to your service named 'boulevard-api' (deployed at https://boulevard-api.onrender.com)"
echo "2. Click 'Manual Deploy' > 'Deploy latest commit'"
echo "3. Wait for the deployment to complete (usually takes 2-5 minutes)"
echo -e "Press Enter once you've started the backend deployment..."
read

# Step 4: Instruct user to deploy frontend
echo -e "\n${YELLOW}Step 4: Deploy frontend service${NC}"
echo "Now, please deploy your frontend service:"
echo "1. Navigate to your boulevard-frontend service on Render"
echo "2. Click 'Manual Deploy'"
echo "3. Select 'Clear build cache & deploy' (very important!)"
echo -e "Press Enter once you've started the frontend redeployment..."
read

echo -e "\n${GREEN}Deployment process started!${NC}"
echo "It may take a few minutes for both services to finish deploying."
echo ""
echo -e "${YELLOW}Testing Instructions:${NC}"
echo "1. Wait 5-10 minutes for both services to fully deploy"
echo "2. Open your frontend app (https://boulevard-frontend.onrender.com)"
echo "3. Try navigating to different pages (e.g., /my-bookings, /cities)"
echo "4. Try refreshing the page on those routes"
echo "5. Try directly accessing a URL like https://boulevard-frontend.onrender.com/my-bookings"
echo ""
echo -e "${GREEN}Additional Instructions for 404 Issues:${NC}"
echo "If you still experience 404 issues on route reloads, consider:"
echo "1. Contacting Render support about their SPA configuration"
echo "2. Running these commands on your next deployment:"
echo "   - RENDER_ROUTING_REWRITE=true npx render deploy"
echo "   - Or add the RENDER_ROUTING_REWRITE=true environment variable in the Render dashboard"
echo ""
echo -e "${GREEN}Happy deployment!${NC}"
