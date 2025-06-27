#!/bin/bash
# filepath: /Users/screechin_03/EcoNest/backend/test-cors.sh
# Test CORS configuration from backend

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== EcoNest CORS Tester =====${NC}"
echo "This script tests CORS configuration on the backend"

# Get the backend URL
DEFAULT_URL="https://econest-70qt.onrender.com/api"
read -p "Enter the backend URL to test (default: $DEFAULT_URL): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-$DEFAULT_URL}

# Test endpoints
ENDPOINTS=(
  "/stats/cities/popular"
  "/stats/cities"
  "/stats/overview"
  "/listings/popular"
)

echo -e "\n${YELLOW}Testing CORS headers on endpoints:${NC}"

for endpoint in "${ENDPOINTS[@]}"; do
  echo -e "\n${YELLOW}Testing $BACKEND_URL$endpoint${NC}"
  
  # First test OPTIONS (preflight)
  echo "OPTIONS request (preflight):"
  curl -s -I -X OPTIONS "$BACKEND_URL$endpoint" \
       -H "Origin: https://econest-frontend.onrender.com" \
       -H "Access-Control-Request-Method: GET" \
       | grep -i "access-control"
  
  # Then test actual GET
  echo -e "\nGET request:"
  curl -s -I -X GET "$BACKEND_URL$endpoint" \
       -H "Origin: https://econest-frontend.onrender.com" \
       | grep -i "access-control"
done

# Test specifically for credentials
echo -e "\n${YELLOW}Testing CORS with credentials:${NC}"
echo -e "\nTesting with credentials (should work with specific origin):"
curl -s -I -X OPTIONS "$BACKEND_URL/stats/cities/popular" \
     -H "Origin: https://econest-frontend.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     | grep -i "access-control"

echo -e "\n${GREEN}Testing complete!${NC}"
echo "If you see Access-Control-Allow-Origin headers in the responses, CORS is configured correctly."
echo "If the Access-Control-Allow-Origin is set to the specific origin (not wildcard *) when credentials are included, that's correct."
echo "If not, there may be an issue with the CORS configuration."
