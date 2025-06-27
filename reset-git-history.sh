#!/bin/zsh

# Reset-git-history.sh
# This script creates a fresh Git history with your current code state
# Effectively removing all secrets from your Git history
# Created: 27 June 2025

echo "=====================================================
WARNING: GIT HISTORY RESET
=====================================================
"

echo "This script will COMPLETELY ERASE your Git history and create a fresh start."
echo "This is often the most reliable way to remove secrets from a repository."
echo ""
echo "Before proceeding:"
echo "1. Make sure you have a backup of your code"
echo "2. Understand that ALL commit history will be lost"
echo "3. All contributor information and timestamps will be lost"
echo ""

read -p "Do you want to proceed with erasing your Git history? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
  echo "Operation cancelled."
  exit 0
fi

echo ""
echo "Starting history reset process..."

# First, let's make sure we have the latest code
echo "1. Checking for any changes we need to save..."
git stash

# Create a new orphan branch (no history)
echo "2. Creating new branch with no history..."
git checkout --orphan fresh-branch

# Add all files from current state
echo "3. Adding all current files..."
git add .

# Remove any remaining .env files from Git (but keep them locally)
echo "4. Making sure no sensitive files are tracked..."
git reset -- backend/.env*
git reset -- frontend/.env*
git reset -- .env*

# Ensure .gitignore is set correctly
echo "5. Updating .gitignore..."
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

# Add the .gitignore
git add .gitignore

# Create first commit in the new history
echo "6. Creating initial commit..."
git commit -m "Initial commit with clean history"

# Backup current main branch
echo "7. Backing up current main branch as main-backup..."
git branch -m main main-backup

# Rename new branch to main
echo "8. Renaming new branch to main..."
git branch -m main

# Force push to origin
echo "9. Force pushing new history to GitHub..."
echo ""
echo "This will overwrite your GitHub repository history."
read -p "Final confirmation - proceed with force push? (yes/no): " push_confirm

if [[ "$push_confirm" == "yes" ]]; then
  git push -f origin main
  echo ""
  echo "✅ Success! Your repository now has a clean history."
  echo ""
  echo "Next steps:"
  echo "1. Revoke and regenerate your Google OAuth credentials"
  echo "2. Update your Render.com environment variables"
  echo "3. Update your local .env file with the new credentials"
else
  echo ""
  echo "Force push cancelled. Your local branches are:"
  echo "- main: New clean history"
  echo "- main-backup: Original history with secrets"
  echo ""
  echo "You can manually push when ready with: git push -f origin main"
fi

echo ""
echo "=====================================================
SECURITY REMINDER
=====================================================
"
echo "Remember to revoke and regenerate your Google OAuth credentials:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Navigate to APIs & Services > Credentials"
echo "3. Delete the existing credentials and create new ones"
echo "4. Update your .env file and deployment environment variables"
echo ""
echo "Never commit credentials to Git repositories!"
