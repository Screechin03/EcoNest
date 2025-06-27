import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaPhone } from 'react-icons/fa';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/"
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaHome className="text-green-500 text-3xl mb-2" />
                        <span className="text-gray-800 font-medium">Go Home</span>
                    </Link>

                    <Link
                        to="/bookings"
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaSearch className="text-blue-500 text-3xl mb-2" />
                        <span className="text-gray-800 font-medium">Search Properties</span>
                    </Link>

                    <Link
                        to="/contact"
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaPhone className="text-orange-500 text-3xl mb-2" />
                        <span className="text-gray-800 font-medium">Contact Us</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
