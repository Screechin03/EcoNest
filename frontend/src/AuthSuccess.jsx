import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setErrorMessage(error === 'auth_failed'
                ? 'Authentication failed. Please try again.'
                : 'There was a problem with your Google sign-in.');
            return;
        }

        if (token) {
            try {
                // Save the token to localStorage
                localStorage.setItem('token', token);

                // Try to parse and save user data if available
                if (userData) {
                    const parsedUser = JSON.parse(decodeURIComponent(userData));
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                }

                setStatus('success');

                // Redirect to home page after a short delay
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 1500);
            } catch (error) {
                console.error('Error processing authentication:', error);
                setStatus('error');
                setErrorMessage('Failed to process login data. Please try again.');
            }
        } else {
            setStatus('error');
            setErrorMessage('No authentication token received. Please try again.');
        }
    }, [searchParams, navigate]);

    if (status === 'processing') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
                    <FaSpinner className="text-4xl text-green-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing your login</h2>
                    <p className="text-gray-500">Please wait while we authenticate you...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-3xl text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Successful!</h2>
                    <p className="text-gray-500 mb-4">You are now being redirected to the homepage...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-3xl text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
                <p className="text-gray-500 mb-6">{errorMessage || 'There was a problem signing you in with Google.'}</p>
                <button
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    onClick={() => navigate('/login')}
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default AuthSuccess;