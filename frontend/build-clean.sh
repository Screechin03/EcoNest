#!/bin/zsh
# filepath: /Users/screechin_03/EcoNest/frontend/build-clean.sh

# This script generates a clean production build with fixes for the "not found" errors

echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Ensure we have the latest node modules
echo "📦 Checking dependencies..."
npm install

# Build with extra optimization flags
echo "🏗️ Building production version..."
npm run build -- --emptyOutDir --minify esbuild

# Ensure we have all the required routing files
echo "🧭 Adding routing configuration..."
if [ ! -f dist/_redirects ]; then
  echo "/* /index.html 200" > dist/_redirects
  echo "Created _redirects file for Netlify"
fi

cp public/_redirects dist/ 2>/dev/null || :
cp vercel.json dist/ 2>/dev/null || :
cp netlify.toml dist/ 2>/dev/null || :

# Create a small index.html validation script
cat > dist/check-spa.js <<EOL
// Script to check if SPA routing is working
document.addEventListener('DOMContentLoaded', function() {
  console.log('SPA route check: ' + window.location.pathname);
  const routeCheck = document.createElement('div');
  routeCheck.id = 'route-check';
  routeCheck.style.display = 'none';
  routeCheck.textContent = 'Route: ' + window.location.pathname;
  document.body.appendChild(routeCheck);
});
EOL

# Add the script to index.html
sed -i.bak -e '</body>/i\
  <script src="/check-spa.js"></script>
' dist/index.html

echo "✅ Build complete! Files in dist/ directory are ready for deployment."
