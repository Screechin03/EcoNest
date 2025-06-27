# Handling Secrets in EcoNest Project

## Overview

This guide provides best practices for managing secrets and sensitive information in the EcoNest project. Proper secret management is crucial for security and to avoid exposing sensitive data.

## What Are Secrets?

Secrets include:
- API keys
- OAuth client IDs and secrets
- Database credentials
- JWT secrets
- Session secrets
- Passwords and passphrases
- Private keys

## Best Practices

### 1. Never Commit Secrets to Git

- Never commit `.env` files or any file containing secrets
- Use `.env.example` files with placeholder values
- Add all secret-containing files to `.gitignore`

### 2. Use Environment Variables

- Store all secrets as environment variables
- Load environment variables using a library like `dotenv`
- Access secrets in code only through `process.env`

### 3. Use Fallbacks Properly

```javascript
// ❌ WRONG - Don't hardcode real credentials as fallbacks
const clientId = process.env.GOOGLE_CLIENT_ID || '961661390470-q1jtgl1gkvcsn2kmg5cc64lkk6pstfph.apps.googleusercontent.com';

// ✅ CORRECT - Use descriptive placeholder or throw an error
const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
// Or even better:
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID environment variable is required');
}
const clientId = process.env.GOOGLE_CLIENT_ID;
```

### 4. Secret Management for Different Environments

#### Local Development
- Use a local `.env` file (not committed to Git)
- Each developer maintains their own secrets

#### CI/CD Pipeline
- Use the CI/CD system's secret management
- Never print secrets in logs

#### Production
- Use the hosting platform's environment variables system
- For Render.com, set them in the dashboard
- Rotate secrets periodically

### 5. Handling Secret Exposure

If secrets are accidentally exposed:
1. Revoke and regenerate the exposed secrets immediately
2. Remove the secrets from Git history (see `fix-git-secrets.sh`)
3. Notify team members and relevant stakeholders
4. Document the incident and improve processes

## EcoNest Specific Guidance

### Google OAuth Configuration

For Google OAuth, you need:
1. `GOOGLE_CLIENT_ID`: From Google Cloud Console
2. `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
3. `SESSION_SECRET`: A secure random string for session encryption

### Setup Process

1. Create a project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth client ID credentials
4. Add authorized redirect URIs:
   - Production: `https://econest-70qt.onrender.com/api/auth/google/callback`
   - Development: `http://localhost:8000/api/auth/google/callback`
5. Add credentials to your `.env` file (never commit this file)
6. Add the same credentials to your deployment platform (Render.com)

## Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Render.com Environment Variables](https://render.com/docs/environment-variables)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
