# Boulevard  - Property Rental and Booking Platform

## Project Overview

Boulevard is a modern property rental and booking platform that allows users to browse, search, and book properties for short-term stays. Originally launched as EcoNest, the platform has been rebranded to Boulevard while maintaining the same core functionality and features.

## Documentation

All project documentation has been moved to the `project-documentation` folder for better organization. Please refer to the [Table of Contents](project-documentation/TABLE_OF_CONTENTS.md) for a complete list of available documentation files.

## Core Features

- **Property Listings**: Browse and search for properties with detailed information and images
- **Booking System**: Book properties for specific dates with real-time availability checking
- **User Authentication**: Secure login/registration system with JWT-based authentication
- **Payment Integration**: Integrated with Razorpay for secure payment processing
- **Reviews & Ratings**: Leave and read reviews for properties
- **Host Dashboard**: Property owners can manage their listings and bookings
- **Newsletter Subscription**: Users can subscribe to receive updates and promotions
- **Contact System**: Contact form for inquiries and support

## Technology Stack

- **Frontend**: React.js with Tailwind CSS for responsive UI
- **Backend**: Node.js with Express.js RESTful API
- **Database**: MongoDB for flexible data storage
- **Authentication**: JWT-based authentication with session support
- **Deployment**: Deployed on Render.com with separate frontend and backend services
- **Payment Processing**: Integrated with Razorpay payment gateway

## Architecture

The application follows a modern client-server architecture:

- Decoupled frontend and backend services
- RESTful API for communication between client and server
- Responsive design for optimal viewing on different devices
- MongoDB for flexible document-based data storage

## Recent Improvements

- Removed Google OAuth authentication to simplify the authentication system
- Enhanced error handling and user feedback
- Improved CORS handling for better cross-domain communication
- Fixed build and deployment issues
- Updated environment variable management for better security

## Target Audience

- Travelers looking for short-term accommodations
- Property owners wanting to list their properties for rent
- Digital nomads seeking flexible living arrangements
- Tourists exploring new destinations

Boulevard aims to provide a seamless booking experience while offering property owners an easy way to manage their listings and connect with potential guests.

## Development Documentation

For detailed development guides, deployment instructions, and implementation details, please refer to:

- [Developer Guide](project-documentation/DEVELOPER_GUIDE.md) - Setup and development instructions
- [Project Description](project-documentation/PROJECT_DESCRIPTION.md) - Detailed project overview
- [Deployment Guide](project-documentation/DEPLOYMENT.md) - Deployment instructions
- [Repository Cleanup](project-documentation/REPOSITORY_CLEANUP.md) - Recent repository cleanup details

See the complete [Documentation Table of Contents](project-documentation/TABLE_OF_CONTENTS.md) for all available documentation.
