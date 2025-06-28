#!/bin/bash
# Cleanup script to remove unnecessary files from the Boulevard/EcoNest repository

# Create a backup directory with current date
BACKUP_DIR="/Users/screechin_03/EcoNest/cleanup_backup"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Function to move files to backup
move_to_backup() {
  local file=$1
  if [ -f "$file" ]; then
    echo "Moving $file to backup"
    cp "$file" "$BACKUP_DIR/$(basename "$file")"
    rm "$file"
  else
    echo "File not found: $file"
  fi
}

# Test files that are no longer needed
TEST_FILES=(
  "/Users/screechin_03/EcoNest/auth-test.html"
  "/Users/screechin_03/EcoNest/login-test.html"
  "/Users/screechin_03/EcoNest/test-bookings.js"
  "/Users/screechin_03/EcoNest/test-login.js"
  "/Users/screechin_03/EcoNest/test-register.mjs"
  "/Users/screechin_03/EcoNest/list-users.js"
)

# Google OAuth related files (since this functionality has been removed)
OAUTH_FILES=(
  "/Users/screechin_03/EcoNest/GOOGLE_OAUTH_GUIDE.md"
  "/Users/screechin_03/EcoNest/deploy-google-auth.sh"
)

# Fix files that are no longer relevant (keep GOOGLE_OAUTH_REMOVED.md as documentation)
FIX_FILES=(
  "/Users/screechin_03/EcoNest/fix-git-secrets.sh"
  "/Users/screechin_03/EcoNest/CORS_RESOLUTION.md"
  "/Users/screechin_03/EcoNest/deploy-cors-fix.sh"
)

# Netlify files (since you're using Render for deployment)
NETLIFY_FILES=(
  "/Users/screechin_03/EcoNest/netlify.toml"
)

# Git history cleanup scripts (should only be used once)
GIT_CLEANUP_FILES=(
  "/Users/screechin_03/EcoNest/clean-git-history.sh"
  "/Users/screechin_03/EcoNest/reset-git-history.sh"
  "/Users/screechin_03/EcoNest/github-push-helper.sh"
)

# Consolidated fix documentation (once implemented, they can be archived)
IMPLEMENTED_FIXES=(
  "/Users/screechin_03/EcoNest/API_URL_FIX.md"
  "/Users/screechin_03/EcoNest/BOOKING_PAGE_FIX.md" 
  "/Users/screechin_03/EcoNest/LOGIN_FIX_SUMMARY.md"
  "/Users/screechin_03/EcoNest/RENDER_404_FIX.md"
  "/Users/screechin_03/EcoNest/UI_ERROR_FIXES.md"
)

# Move files to backup
echo "Moving test files to backup..."
for file in "${TEST_FILES[@]}"; do
  move_to_backup "$file"
done

echo "Moving OAuth files to backup..."
for file in "${OAUTH_FILES[@]}"; do
  move_to_backup "$file"
done

echo "Moving fix files to backup..."
for file in "${FIX_FILES[@]}"; do
  move_to_backup "$file"
done

echo "Moving Netlify files to backup..."
for file in "${NETLIFY_FILES[@]}"; do
  move_to_backup "$file"
done

echo "Moving Git cleanup files to backup..."
for file in "${GIT_CLEANUP_FILES[@]}"; do
  move_to_backup "$file"
done

echo "Moving implemented fix documentation to backup..."
for file in "${IMPLEMENTED_FIXES[@]}"; do
  move_to_backup "$file"
done

echo "Cleanup complete! Files have been moved to $BACKUP_DIR"
echo "You can review the files before permanently deleting them."
echo "To delete the backup directory, run: rm -rf $BACKUP_DIR"
