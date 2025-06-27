import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { API_URL } from '../config';

const GoogleSignInButton = ({ text = "Continue with Google" }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        // Redirect to the backend Google auth endpoint
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={{
                backgroundColor: 'white',
                color: '#4285F4'
            }}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <FcGoogle className="w-5 h-5" />
            )}
            <span className="font-medium">{isLoading ? 'Connecting...' : text}</span>
        </button>
    );
};

export default GoogleSignInButton;