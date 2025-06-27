# EcoNest Deployment Guide

This guide explains how to deploy the EcoNest application on Render.com as separate frontend (static site) and backend (web service) deployments.

## Prerequisites

- A Render.com account
- Git repository for your project
- MongoDB Atlas database
- Cloudinary account for image uploads
- Razorpay account for payments
- Email service credentials

## Environment Variables Setup

### Backend Environment Variables

You'll need to set the following environment variables in your Render.com dashboard for the backend web service:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `RAZORPAY_KEY_ID`: Your Razorpay API key
- `RAZORPAY_KEY_SECRET`: Your Razorpay secret key
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASS`: Email password or app password
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `NODE_ENV`: Set to "production"
- `PORT`: Render sets this automatically, but you can specify a custom port

## Deployment Steps

### Backend Deployment (Web Service)

1. Log in to your Render.com dashboard
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Configure the service with the following settings:
   - **Name**: econest-api (or your preferred name)
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your production branch)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (or select a paid plan for production)
5. Add all the environment variables listed above
6. Click "Create Web Service"

### Frontend Deployment (Static Site)

1. Before deploying, ensure the `config.js` file in the frontend has the correct production API URL:
   ```js
   // Production API URL
   export const API_URL = 'https://econest-api.onrender.com/api';
   
   // For local development, uncomment this line and comment out the line above
   // export const API_URL = 'http://localhost:8000/api';
   ```

2. Log in to your Render.com dashboard
3. Click "New" and select "Static Site"
4. Connect your Git repository
5. Configure the service with the following settings:
   - **Name**: econest-frontend (or your preferred name)
   - **Branch**: main (or your production branch)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Region**: Choose the region closest to your users
6. Click "Create Static Site"

## API Configuration

We've centralized API URL configuration to make deployment and local development easier:

1. Created a `config.js` file in the frontend's src directory
2. Updated all fetch calls in the application to use the centralized API_URL
3. This allows easy switching between development and production environments

### Files Updated:
- Login.jsx
- Register.jsx
- BookingPage.jsx
- PropertyDetails.jsx
- MyBookings.jsx
- Contact.jsx
- and many others

## Post-Deployment Verification

After both services are deployed, verify that:

1. The backend API is accessible at your Render URL
2. The frontend can successfully connect to the backend
3. All features work as expected:
   - User authentication
   - Property listings
   - Bookings
   - Payments
   - Reviews
   - Contact forms

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors, verify the allowed origins in your backend `index.js` file
- **API Connection Issues**: Check that the API_URL in `config.js` is correct
- **Missing Environment Variables**: Verify all required environment variables are set in Render
- **404 on Routes**: Confirm the `_redirects` file is included in your build

## Deployment Alternatives

If you prefer not to use Render, here are some alternatives:

- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, DigitalOcean App Platform, AWS Elastic Beanstalk

## Local Development After Deployment

For local development after deployment:

1. Update `config.js` to use a local API URL:
   ```js
   export const API_URL = 'http://localhost:8000/api';
   ```

2. Run the backend and frontend servers locally:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

---

For any deployment issues, refer to the [Render documentation](https://render.com/docs) or contact the Render support team.
