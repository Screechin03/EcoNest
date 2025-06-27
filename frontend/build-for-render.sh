#!/bin/bash
# filepath: /Users/screechin_03/EcoNest/frontend/build-for-render.sh

# This script builds the frontend for Render deployment with SPA routing fixes
echo "🚀 Building Boulevard frontend for Render deployment"

# Clean previous builds
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build with the minimal configuration
echo "🏗️ Building the application..."
VITE_API_URL=https://econest-70qt.onrender.com/api \
VITE_APP_RAZORPAY_KEY_ID=rzp_test_CfHijwdCzAevEK \
npx vite build --config vite.config.minimal.js

# Create SPA routing files for various hosting platforms
echo "🧭 Setting up SPA routing files..."

# Netlify (_redirects)
echo "/* /index.html 200" > dist/_redirects
echo "Created Netlify _redirects file"

# Create a specialized Render routes file
cat > dist/render-routes.json <<EOL
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
EOL
echo "Created Render routes configuration"

# Create a 200.html file (used by some static hosts)
cp dist/index.html dist/200.html
echo "Created 200.html"

# Create a 404.html that redirects to index.html
cat > dist/404.html <<EOL
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Redirect to the root with the current path in the URL
    const path = window.location.pathname;
    window.location.href = '/#' + path;
    // Alternative approach using history API if supported
    if (window.history && window.history.replaceState) {
      try {
        window.history.replaceState(null, null, '/');
        window.location.reload();
      } catch(e) {
        window.location.href = '/';
      }
    }
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body>
  <p>Redirecting to homepage...</p>
</body>
</html>
EOL
echo "Created 404.html with redirect script"

# Create a simple server file that serves the SPA correctly (for Express-based hosting)
cat > dist/server.js <<EOL
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`Serving EcoNest frontend on port \${port}\`);
});
EOL
echo "Created Express server.js for alternative deployment"

# Inject a router checker script into index.html
echo "📋 Adding route validation script..."
sed -i '.bak' -e 's|</body>|<script>console.log("SPA Route:", window.location.pathname); window.addEventListener("popstate", () => console.log("Navigation event:", window.location.pathname));</script></body>|' dist/index.html
rm dist/index.html.bak

echo "✅ Build complete and ready for Render deployment!"
echo "📂 Files generated in the dist/ directory"
