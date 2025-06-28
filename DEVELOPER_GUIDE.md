# Developer Guide: Testing & Deploying Boulevard Improvements

This guide provides instructions for developers to test and deploy the Boulevard application improvements.

## Repository Structure

The Boulevard (formerly EcoNest) codebase is organized as follows:

### Main Directories
- `/frontend` - React.js frontend application with Tailwind CSS
- `/backend` - Node.js/Express.js backend API server

### Documentation Files
- `PROJECT_DESCRIPTION.md` - Overview of the entire project
- `DEPLOYMENT.md` and `DEPLOYMENT_SUMMARY.md` - Deployment instructions
- `DEVELOPER_GUIDE.md` - This guide for developers
- `TEST_PLAN.md` - Comprehensive testing plan

### Backend Structure
- `/backend/config` - Database and authentication configuration
- `/backend/controllers` - Business logic for API endpoints
- `/backend/middleware` - Authentication and validation middleware
- `/backend/models` - MongoDB data models
- `/backend/routes` - API route definitions
- `/backend/utils` - Helper functions and utilities

### Frontend Structure
- `/frontend/src/components` - Reusable UI components
- `/frontend/src/pages` - Main application pages
- `/frontend/src/services` - API communication services
- `/frontend/src/utils` - Helper functions and utilities
- `/frontend/public` - Static assets

## Setting Up for Testing

### Local Development Environment

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-org/boulevard.git
   cd boulevard
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Required backend variables:
     ```
     PORT=8000
     MONGODB_URI=mongodb://localhost:27017/boulevard
     JWT_SECRET=your_jwt_secret_here
     SESSION_SECRET=your_session_secret_here
     EMAIL_USER=your_test_email@gmail.com
     EMAIL_PASS=your_email_app_password
     RAZORPAY_KEY_ID=rzp_test_key
     RAZORPAY_KEY_SECRET=razorpay_test_secret
     ```
   - Required frontend variables:
     ```
     VITE_API_URL=http://localhost:8000/api
     VITE_APP_RAZORPAY_KEY_ID=rzp_test_key
     ```

   > Note: Google OAuth has been removed, so no Google credentials are required.

3. Start the development servers:
   ```bash
   # Start backend (from the backend directory)
   npm run dev
   
   # Start frontend (from the frontend directory)
   npm run dev
   ```

## Testing the Improvements

### 1. Payment Animation Testing

1. Create a test user account or use an existing one
2. Browse available properties and select one to book
3. Select dates and proceed to the payment page
4. Click "Pay Securely with Razorpay" and observe the animation
5. Verify that the animation displays for approximately 1.5 seconds before Razorpay loads

**Key Files to Review:**
- `/frontend/src/PaymentPage.jsx` - Contains the animation logic and UI components
- `/frontend/src/index.css` - Contains animation delay utilities
- `/frontend/tailwind.config.js` - Contains animation configuration

### 2. Email Branding Testing

1. Configure a test email account in the backend `.env` file
2. Complete a booking to trigger confirmation emails
3. Check the inbox of both the guest and host email addresses
4. Verify that all instances of "EcoNest" have been replaced with "Boulevard"

**Testing Tips:**
- Use a service like Mailtrap.io for testing emails in development
- Alternatively, use a personal email for testing but add a "+test" suffix:
  - Example: `your.email+test@gmail.com` will still deliver to `your.email@gmail.com`

**Key Files to Review:**
- `/backend/utils/email.js` - Contains all email templates and branding

### 3. Total Amount Display Testing

1. Book a single property and complete payment
2. Verify the correct amount appears in the success animation
3. Book multiple properties in one session (if feature is available)
4. Verify the total amount is correctly calculated as the sum of all bookings

**Key Files to Review:**
- `/backend/routes/bookingRoutes.js` - Contains the totalAmount calculation
- `/frontend/src/PaymentPage.jsx` - Contains the formatPrice function and total display

### 4. Location Alignment Testing

1. Complete a booking for a property with a long location name
2. Check the booking confirmation screen
3. Verify that the location information is right-aligned and properly formatted

**Key Files to Review:**
- `/frontend/src/PaymentPage.jsx` - Contains the alignment styling for location information

## Using the Verification Script

A verification script is provided to help test key functionality:

1. Navigate to the booking page in your browser
2. Open the developer console (F12 or right-click > Inspect > Console)
3. Import and run the verification script:
   ```javascript
   import('/src/utils/verificationScript.js').then(module => console.log('Verification script loaded'));
   ```
   Or copy-paste the script contents directly into the console

4. Review the test results output in the console

## Deployment Checklist

Before deploying to production, ensure:

1. All tests in TEST_PLAN.md have been completed successfully
2. Email templates have been tested with real email addresses
3. Payment processing works with both test and production Razorpay keys
4. All "Boulevard" branding is consistent throughout the application
5. The application has been tested on multiple devices and browsers

### Deployment Steps

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Update environment variables for production in both frontend and backend

3. Deploy backend to your hosting service:
   ```bash
   cd backend
   npm run start
   ```

4. Deploy the frontend build directory to your static hosting service

5. After deployment, perform a final verification on the live site:

## Repository Maintenance

The repository has been cleaned up to remove unnecessary test files, old fix documentation, and other temporary files. This ensures the codebase remains clean and maintainable.

### What Was Removed

- Test files like `auth-test.html`, `login-test.html`, `test-login.js`
- Google OAuth related files (since the feature was removed)
- Netlify configuration files (since we're using Render for deployment)
- Old fix documentation that has been implemented
- Git history cleanup scripts

### If You Need These Files

All removed files have been backed up to the `/cleanup_backup` directory. If you need to reference them, check there before recreating them.

### Adding New Tests

When adding new test files:

1. Place them in appropriate test directories:
   - Frontend tests in `/frontend/tests` or `/frontend/__tests__`
   - Backend tests in `/backend/tests`

2. Name tests descriptively:
   - Use `feature-name.test.js` format
   - Avoid generic names like `test1.js`

3. Document the purpose of test files in code comments
   - Complete a test booking
   - Verify emails are sent correctly with Boulevard branding
   - Check payment processing and animation
   - Verify all booking information displays correctly

## Troubleshooting Common Issues

### Animation Not Displaying
- Check browser console for errors
- Verify CSS classes are correctly applied
- Ensure Tailwind is processing the animation classes

### Email Branding Issues
- Check email templates in `/backend/utils/email.js`
- Verify all instances of "EcoNest" have been replaced
- Check email sending configuration

### Payment Processing Issues
- Verify Razorpay API keys are correct
- Check payment handler in PaymentPage.jsx
- Review backend payment confirmation endpoint

## Additional Resources

- [Razorpay Test Documentation](https://razorpay.com/docs/payment-gateway/test-card-details/)
- [Tailwind Animation Documentation](https://tailwindcss.com/docs/animation)
- [Nodemailer Documentation](https://nodemailer.com/about/) for email testing
