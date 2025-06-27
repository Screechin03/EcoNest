import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Animation styles for redirect message
const redirectMessageStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    color: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    textAlign: 'center',
    transition: 'opacity 0.5s ease-in-out',
    maxWidth: '80%'
};

export const RedirectMessage = ({ message }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Start fade out after 1 second
        const timer = setTimeout(() => {
            setVisible(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            ...redirectMessageStyle,
            opacity: visible ? 1 : 0
        }}>
            <p className="text-lg font-medium">{message}</p>
        </div>
    );
};

// Check if user is logged in
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // If there's a token in localStorage, check if it's expired
        // Tokens are Base64Url encoded, with 3 parts separated by dots
        const payload = token.split('.')[1];
        if (!payload) return false;

        // Decode the base64 payload
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

        // Check if token is expired
        const expiryTime = decodedPayload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= expiryTime) {
            // Token is expired, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }

        return true;
    } catch (error) {
        // If there's any error parsing the token, consider it invalid
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    }
};

// Enhanced version with redirect message
export const RedirectIfAuthenticated = ({ children }) => {
    const isLoggedIn = isAuthenticated();
    const [showMessage, setShowMessage] = useState(isLoggedIn);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            // Wait a bit to show the message before redirecting
            const timer = setTimeout(() => {
                setRedirect(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return children;
    }

    if (redirect) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <RedirectMessage message="You are already logged in. Redirecting to home..." />
            <div style={{ opacity: 0.3 }}>{children}</div>
        </>
    );
};

// Component to redirect if user is NOT logged in (for protected routes)
export const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};
