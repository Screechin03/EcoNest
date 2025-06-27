# Google OAuth Implementation Guide for EcoNest

This guide provides instructions for setting up and testing Google OAuth authentication for the EcoNest application.

## 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: EcoNest
   - User support email: Your email
   - Developer contact information: Your email
6. Select "Web application" as the application type
7. Add authorized redirect URIs:
   - For production: `https://econest-70qt.onrender.com/api/auth/google/callback`
   - For development: `http://localhost:8000/api/auth/google/callback`
8. Click "Create"
9. Note your Client ID and Client Secret

## 2. Environment Variables

Make sure the following environment variables are set in your Render.com dashboard:

- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `SESSION_SECRET`: A secure random string (e.g., `econest_session_secret_key`)
- Other required variables (MONGODB_URI, JWT_SECRET, etc.)

## 3. Deployment on Render.com

1. Set the environment variables in your Render.com dashboard
2. Deploy using the provided script:
   ```
   ./deploy-google-auth.sh
   ```

## 4. Common Issues and Troubleshooting

### "OAuth2Strategy requires a clientID option" Error

This error occurs when the application can't find the Google OAuth client ID. Check:

1. Your environment variables are set correctly in Render.com dashboard
2. Your `.env` file doesn't have comments or incorrect formatting
3. The application is loading the environment variables before initializing Passport

### Session Issues

If you're seeing memory leaks or session problems:

1. We've configured a MongoDB session store to fix the MemoryStore warning
2. Make sure your MongoDB connection is working correctly

### Redirect URI Errors

If Google returns an error about invalid redirect URIs:

1. Double-check that your authorized redirect URIs in Google Cloud Console match exactly what's in your code
2. Ensure the callback URL is constructed correctly based on the environment (development/production)

### CORS Issues

If you're seeing CORS errors after authentication:

1. Ensure your frontend URLs are in the allowed origins list
2. Check that your CORS configuration includes the necessary headers and credentials

## 5. Testing

1. Click the "Sign in with Google" button on the login page
2. You should be redirected to the Google login page
3. After logging in with Google, you should be redirected back to the EcoNest application
4. You should see the success page and then be redirected to the homepage

## 6. Production Environment Recommendations

1. Use a more secure session secret in production
2. Configure proper session timeouts
3. Set up monitoring for authentication failures
4. Implement rate limiting for authentication endpoints
