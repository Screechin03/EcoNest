# Repository Cleanup

## Overview
This document explains the repository cleanup performed on June 28, 2025, to remove unnecessary test files, fix documentation, and other temporary files that are no longer needed for the Boulevard (formerly EcoNest) project.

## Files Removed

### Test Files
- `auth-test.html` - Test page for authentication functionality
- `login-test.html` - Test page for login functionality
- `test-bookings.js` - Test script for booking functionality
- `test-login.js` - Test script for login API
- `test-register.mjs` - Test script for registration API
- `list-users.js` - Script to list users from the database

### Google OAuth Related Files
- `GOOGLE_OAUTH_GUIDE.md` - Guide for the removed Google OAuth functionality
- `deploy-google-auth.sh` - Deployment script for Google authentication

### Fix Files
- `fix-git-secrets.sh` - Script to fix Git secrets issues
- `CORS_RESOLUTION.md` - Documentation for CORS issues that have been resolved
- `deploy-cors-fix.sh` - Deployment script for CORS fixes

### Netlify Files
- `netlify.toml` - Netlify configuration (since we're using Render for deployment)

### Git Cleanup Files
- `clean-git-history.sh` - Script to clean Git history
- `reset-git-history.sh` - Script to reset Git history
- `github-push-helper.sh` - Helper script for GitHub pushing

### Implemented Fix Documentation
- `API_URL_FIX.md` - Documentation for API URL fixes
- `BOOKING_PAGE_FIX.md` - Documentation for booking page fixes 
- `LOGIN_FIX_SUMMARY.md` - Documentation for login fixes
- `RENDER_404_FIX.md` - Documentation for Render 404 issues
- `UI_ERROR_FIXES.md` - Documentation for UI error fixes

## Backup Process
All removed files have been backed up to a directory named `cleanup_backup_YYYYMMDD` before removal. If any files need to be recovered, they can be found in this backup directory.

## Remaining Documentation
The following important documentation files have been kept:

1. `PROJECT_DESCRIPTION.md` - Main project description
2. `DEPLOYMENT_SUMMARY.md` - Summary of deployment process
3. `DEVELOPER_GUIDE.md` - Guide for developers
4. `GOOGLE_OAUTH_REMOVED.md` - Documentation about the removed Google OAuth feature
5. `DEPLOYMENT.md` - Main deployment documentation
6. `TEST_PLAN.md` - Test plan for the application

## Next Steps
1. Commit the cleaned repository to Git
2. Continue development with a cleaner, more focused codebase
3. Update remaining documentation as needed
