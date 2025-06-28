# API URL Fix for Boulevard (Formerly EcoNest)

## Current Issue

The application has been rebranded from "EcoNest" to "Boulevard", but the backend API is still deployed at the old URL (https://econest-70qt.onrender.com/api). This inconsistency caused the listings routes and popular listings functionality to break.

## Build Error Fix (June 28, 2025)

The frontend build was failing with the following error:
```
Cannot reassign a variable declared with `const`
import.meta.env = import.meta.env || {};
```

This error occurred because `import.meta.env` is a read-only property in Vite/Rollup, and we were attempting to assign a value to it.

### Fix Applied
Updated the `src/config.js` file to:

1. Remove the problematic line: `import.meta.env = import.meta.env || {}`
2. Use a safer approach for environment detection:
   ```javascript
   // Check if running in development based on environment
   // We can't modify import.meta.env, but we can read from it
   if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
     apiUrl = 'http://localhost:8000/api';
     console.log('Development mode: Using local API', apiUrl);
   } else {
     apiUrl = 'https://econest-70qt.onrender.com/api';
     console.log('Production mode: Using remote API', apiUrl);
   }
   ```
3. Default to production URL to ensure the app works even if environment detection fails

## Temporary Fix Implemented

As a temporary fix, we've reverted the API URL in the frontend configuration to point back to the existing backend service, while keeping the Boulevard branding in the frontend application.

## How to Test the Fix

1. Run a production build locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Verify no build errors related to `import.meta.env`
3. Deploy to Render and confirm successful build
4. Test the login and registration functionality using the test page: `/login-test.html`

## Related Changes
- Also updated `backend/verify-env.js` to remove references to Google OAuth credentials, which are no longer used in the application.

## Future Migration Steps

To complete the branding transition and properly migrate the backend:

1. **Deploy a New Backend Service**
   - Create a new Render web service named `boulevard-api`
   - Use the same codebase with updated branding
   - Configure all necessary environment variables
   - Ensure database connections are properly set up

2. **Update Frontend Configuration**
   - Once the new backend is deployed and tested, update `config.js` to point to the new API URL:
     ```javascript
     // Production API URL
     export const API_URL = 'https://boulevard-api.onrender.com/api';
     ```

3. **Update Deployment Files**
   - Ensure all references in the deployment configuration files are updated
   - Update `render.yaml` service names and URL references

4. **Data Migration**
   - If necessary, migrate data from the old backend to the new one
   - Test the data integrity after migration

5. **Verification**
   - Verify all functionality works with the new backend
   - Test user authentication, listings, bookings, and payments

## Troubleshooting

If the temporary fix doesn't resolve the issue:

1. Check if the old API endpoint is still active:
   ```bash
   curl -s -v "https://econest-70qt.onrender.com/api/listings/popular?limit=1"
   ```

2. If the old API is unavailable, you may need to redeploy the backend service on Render.com

3. For immediate local testing, switch to local development mode in `config.js`:
   ```javascript
   // export const API_URL = 'https://econest-70qt.onrender.com/api';
   export const API_URL = 'http://localhost:8000/api';
   ```
