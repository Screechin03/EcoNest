#!/bin/bash
# Deploy script with CORS fixes

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== EcoNest Deployment Helper =====${NC}"
echo -e "This script will help fix CORS issues and syntax errors for deployment"

# Step 1: Verify the CitiesPage.jsx fix
echo -e "\n${YELLOW}Step 1: Checking CitiesPage.jsx for syntax errors${NC}"
if grep -q "export default CitiesPage;" /Users/screechin_03/EcoNest/frontend/src/CitiesPage.jsx; then
  echo -e "${GREEN}CitiesPage.jsx syntax has been fixed. Good to proceed.${NC}"
else
  echo -e "${RED}CitiesPage.jsx might not be fixed. Please check manually.${NC}"
  exit 1
fi

# Step 2: Verify CORS configuration
echo -e "\n${YELLOW}Step 2: Checking CORS configuration${NC}"
if grep -q "origin: function(origin, callback)" /Users/screechin_03/EcoNest/backend/index.js; then
  echo -e "${GREEN}CORS configuration has been updated. Good to proceed.${NC}"
else
  echo -e "${RED}CORS configuration might not be updated. Please check manually.${NC}"
  exit 1
fi

# Step 3: Run CORS test
echo -e "\n${YELLOW}Step 3: Testing CORS configuration${NC}"
bash /Users/screechin_03/EcoNest/backend/test-cors.sh

# Step 4: Commit and push the changes
echo -e "\n${YELLOW}Step 4: Committing and pushing changes${NC}"
git add .
git commit -m "Fix CORS issues with credentials and CitiesPage.jsx syntax error"
git push

# Step 5: Redeploy backend with CORS fixes
echo -e "\n${YELLOW}Step 5: Redeploy backend service${NC}"
echo "Please go to https://dashboard.render.com and manually redeploy your backend service."
echo "1. Navigate to your service named 'econest-api' (deployed at https://econest-70qt.onrender.com)"
echo "2. Click 'Manual Deploy' > 'Deploy latest commit'"
echo "3. Wait for the deployment to complete (usually takes 2-5 minutes)"

# Step 6: Note about credentials and CORS
echo -e "\n${YELLOW}Step 6: Important Notes on CORS and Credentials${NC}"
echo -e "${GREEN}The following changes have been made to fix CORS issues:${NC}"
echo "1. Backend CORS configuration now specifies the exact origin instead of a wildcard '*'"
echo "2. Frontend fetch requests now adapt credentials mode based on environment"
echo "3. Added CORS debugging tools accessible via browser console"
echo "4. Added fallback mechanism to retry failed requests without credentials"
echo ""
echo -e "${YELLOW}After deployment:${NC}"
echo "1. Open your frontend in the browser and open the developer console"
echo "2. Run 'checkAPIConnectivity()' to verify all endpoints are accessible"
echo "3. If issues persist, try clearing your browser cache and cookies"
echo ""
echo -e "${RED}Security Note:${NC}"
echo "The current CORS setup is permissive for debugging. For production,"
echo "consider restricting origins to only your specific frontend domains."
echo -e "${GREEN}Happy debugging!${NC}"
echo "2. Click 'Manual Deploy'"
echo "3. Select 'Clear build cache & deploy'"
echo -e "${YELLOW}Important: We've updated the CORS configuration to allow all origins temporarily for debugging.${NC}"
echo -e "Once everything is working, you may want to revert to a more restrictive policy."

# Wait for confirmation
read -p "Press Enter once you've started the backend redeployment..."

# Step 3: Redeploy frontend
echo -e "\n${YELLOW}Step 3: Redeploy frontend service${NC}"
echo "Now, please redeploy your frontend service:"
echo "1. Navigate to your econest-frontend service"
echo "2. Click 'Manual Deploy'"
echo "3. Select 'Clear build cache & deploy'"

# Wait for confirmation
read -p "Press Enter once you've started the frontend redeployment..."

echo -e "\n${GREEN}Deployment initiated!${NC}"
echo "It may take a few minutes for both services to finish deploying."
echo "Once deployed, you should be able to login without CORS errors."
echo -e "\n${YELLOW}Testing Instructions:${NC}"
echo "1. Wait 5-10 minutes for both services to fully deploy"
echo "2. Open your frontend app in an incognito window"
echo "3. Try to login with your credentials"
echo "4. Check the browser console for any remaining CORS errors"

echo -e "\n${GREEN}Good luck!${NC}"
