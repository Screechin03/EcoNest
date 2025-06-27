# Contact Page and Route Implementation

## Overview
This document outlines the implementation of the contact page and backend API route for the Boulevard (EcoNest) application. The contact page provides users with a way to send inquiries, feedback, or support requests to the Boulevard team.

## Features

### Frontend Components
1. **Contact Form**
   - User-friendly form with validation
   - Fields for name, email, subject, and message
   - Responsive design for all devices
   - Success/error notifications
   - Animated transitions and hover effects

2. **Customer Testimonials**
   - Display of customer quotes with staggered animations
   - Attribution with names and locations
   - Attractive styling with quote icons
   - Hover effects and shadows

3. **Office Locations**
   - Visual representation of Boulevard offices
   - Address and contact details for each location
   - Images of each office (with fallback images)
   - Interactive hover animations

4. **FAQ Section**
   - Interactive accordion for common questions and answers
   - Animated expand/collapse functionality
   - Clear, concise information
   - Helps reduce common support inquiries

5. **Call to Action**
   - Animated appearance and hover effects
   - Links to browse properties or become a host
   - Encourages further engagement with the platform

### Backend Components
1. **Contact API Endpoint**
   - Route: `/api/contact/submit`
   - Method: POST
   - Accepts form data (name, email, subject, message)
   - Validates input data
   - Stores submissions in database
   - Sends notification emails

2. **Admin Management Routes**
   - Route: `/api/contact/admin` - Get all submissions
   - Route: `/api/contact/admin/:id` - Update submission status
   - Allows admin to mark submissions as read/resolved
   - Supports adding admin notes to submissions

3. **Email Notifications**
   - Admin notification of new contact submissions
   - User confirmation of message receipt
   - HTML-formatted emails with styling
   - Plain text fallback for email clients

## Technical Implementation

### Frontend Files
- `/src/Contact.jsx` - Main contact page component with animations and interactivity
- Images in `/public/`:
  - `contact-hero.jpg`
  - `office-mumbai.jpg`
  - `office-delhi.jpg`
  - `office-bangalore.jpg`

### Backend Files
- `/models/contactModel.js` - MongoDB schema for contact submissions
- `/routes/contactRoutes.js` - API route handlers
- Uses existing email utility functions

### Database Schema
```javascript
{
  name: String,
  email: String,
  subject: String,
  message: String,
  status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' },
  isRead: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date,
  notes: String
}
```

### Route Registration
- Frontend: Added to App.jsx router
- Backend: Registered in index.js as `/api/contact`

## Usage

### User Flow
1. User navigates to `/contact`
2. Animated page elements load with staggered timing
3. User fills out the contact form
4. Submits the form
5. Receives success notification
6. Gets confirmation email
7. Admin receives notification email
8. Submission stored in database

### Admin Flow
1. Admin accesses contact management interface
2. Views list of all contact submissions
3. Can mark submissions as read/in-progress/resolved
4. Can add internal notes to submissions
5. Can filter/sort submissions by status, date, etc.

### Error Handling
- Form validation prevents invalid submissions
- Backend validation provides additional security
- Error messages display for failed submissions
- Network errors are handled gracefully
- Fallback images for loading failures

## Design Considerations
- Consistent with Boulevard's eco-friendly branding
- Green color scheme throughout
- Modern, clean UI with rounded corners
- Interactive animations and transitions for better engagement
- Responsive for mobile, tablet, and desktop
- Accordion pattern for FAQs to reduce visual clutter
- Fallback images if primary images fail to load

## Future Enhancements
- Live chat integration
- Contact category selection
- File attachment support
- FAQ search functionality
- Support ticket tracking system
- Admin dashboard for contact management
- Response templates for common inquiries
- Integration with CRM systems

## Testing

### Manual Testing Steps
1. Visit `/contact`
2. Test form with valid data
3. Test form with invalid data
4. Check email delivery
5. Verify responsive design on multiple devices
6. Test accordion functionality
7. Verify animations work on different browsers

### Expected Results
- Form submits successfully with valid data
- Validation prevents invalid submissions
- Confirmation displays after submission
- Admin receives notification email
- User receives confirmation email
- Submissions are stored in database
- Animations work smoothly across devices
