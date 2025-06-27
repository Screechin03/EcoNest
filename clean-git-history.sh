#!/bin/bash

echo "=== Git Clean History Script ==="
echo "This script will help remove sensitive data from your Git history."
echo "WARNING: This will rewrite your Git history. All collaborators will need to re-clone."
echo ""

# Identify commits containing sensitive data
echo "Commits that may contain sensitive data:"
echo ""
git log --all --grep="GOOGLE_CLIENT_ID\|GOOGLE_CLIENT_SECRET" --oneline
echo ""

# Confirm
read -p "Do you want to proceed with cleaning the history? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Create a temporary branch
current_branch=$(git branch --show-current)
temp_branch="temp-clean-$(date +%s)"
echo "Creating temporary branch: $temp_branch"
git checkout -b "$temp_branch"

# Reset to an early commit before any sensitive data was added
# Find a good early commit
echo ""
echo "List of early commits to choose from:"
git log --pretty=format:"%h %ad %s" --date=short | tail -n 20
echo ""
read -p "Enter the hash of an early commit BEFORE any sensitive data was added: " early_commit

# Reset to that early commit
git reset --hard "$early_commit"

# Recreate the .gitignore with proper exclusions
cat > .gitignore << 'EOL'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.*.local
.env.fixed
.env.backup
*.env
EOL

# Commit the .gitignore
git add .gitignore
git commit -m "chore: update gitignore to exclude all environment files"

# Create placeholder .env files
mkdir -p backend
cat > backend/.env.example << 'EOL'
# Environment variables example
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=8000
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_key
EOL

# Commit the example env file
git add backend/.env.example
git commit -m "chore: add env example file without sensitive data"

# Create proper passport.js file
mkdir -p backend/config
cat > backend/config/passport.js << 'EOL'
// Backend passport.js configuration
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userSchema from '../models/userMode.js';

const setupPassport = () => {
    // Debug logs for environment variables
    console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
    
    // Configure Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://econest-70qt.onrender.com/api/auth/google/callback'
            : 'http://localhost:8000/api/auth/google/callback',
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find existing user by Google ID
            let user = await userSchema.findOne({ googleId: profile.id });
            
            // If user not found by Google ID, try to find by email
            if (!user && profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = await userSchema.findOne({ email });
                
                // If user exists by email but no Google ID, update with Google details
                if (user) {
                    user.googleId = profile.id;
                    if (profile.photos && profile.photos.length > 0) {
                        user.profilePicture = profile.photos[0].value;
                    }
                    await user.save();
                }
            }
            
            // If no user found, create a new user
            if (!user) {
                // Get user details from Google profile
                const email = profile.emails && profile.emails.length > 0 
                    ? profile.emails[0].value 
                    : '';
                
                const profilePicture = profile.photos && profile.photos.length > 0 
                    ? profile.photos[0].value 
                    : '';

                // Create new user
                user = new userSchema({
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                    profilePicture,
                    role: 'viewer' // Default role for Google auth users
                });
                
                await user.save();
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userSchema.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
    
    return passport;
};

export default setupPassport;
EOL

# Commit the passport.js file
git add backend/config/passport.js
git commit -m "chore: add passport.js configuration without sensitive data"

# Force push to main
echo ""
echo "Ready to force push to main branch. This will overwrite the remote history."
read -p "Are you absolutely sure you want to continue? (type 'YES' to confirm): " final_confirm

if [[ "$final_confirm" == "YES" ]]; then
  echo "Force pushing to main branch..."
  git push origin "$temp_branch":main --force
  
  # Checkout the original branch
  git checkout "$current_branch"
  
  # Update the local main branch
  git branch -D main
  git checkout -b main origin/main
  
  # Delete the temporary branch
  git branch -D "$temp_branch"
  
  echo "Done! Repository history has been cleaned."
else
  echo "Operation cancelled."
  git checkout "$current_branch"
  git branch -D "$temp_branch"
fi
