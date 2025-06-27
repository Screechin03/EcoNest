import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import React, { useEffect } from 'react'
import Navbar from './navbar.jsx'
import HomePage from './HomePage.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Listings from './Listings.jsx'
import ListingPage from './ListingPage.jsx'
import BookingPage from './BookingPage.jsx'
import PropertyDetails from './PropertyDetails.jsx'
import MyBookings from './MyBookings.jsx'
import BookingDetails from './BookingDetails.jsx'
import OwnerBookings from './OwnerBookings.jsx'
import BookingSummary from './BookingSummary.jsx'
import CitiesPage from './CitiesPage.jsx'
import Contact from './Contact.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { RedirectIfAuthenticated, ProtectedRoute } from './utils/AuthUtils.jsx'
import Footer from './components/Footer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
// Import for debugging purposes - will be available in console
import './utils/corsDebugger.js'
// Import production checker utility
import './utils/production-checker.js'
// Import navigation handler to fix "not found" errors
import './utils/navigationHandler.js'

function App() {
  React.useEffect(() => {
    // Hide the error container since React has loaded successfully
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              } />
              <Route path="/register" element={
                <RedirectIfAuthenticated>
                  <Register />
                </RedirectIfAuthenticated>
              } />
              <Route path="/createListing" element={
                <ProtectedRoute>
                  <Listings />
                </ProtectedRoute>
              } />
              <Route path="/listing" element={<ListingPage />} />
              <Route path="/bookings" element={<BookingPage />} />
              <Route path="/listing/:id" element={<PropertyDetails />} />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />
              <Route path="/booking/:id" element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              } />
              <Route path="/owner-bookings" element={
                <ProtectedRoute>
                  <OwnerBookings />
                </ProtectedRoute>
              } />
              <Route path="/booking-summary" element={<BookingSummary />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/contact" element={<Contact />} />
              {/* Catch 404 errors with NotFoundPage */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </ErrorBoundary>
    </Router>
  )
}

export default App