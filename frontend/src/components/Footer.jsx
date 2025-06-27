import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { isAuthenticated } from '../utils/AuthUtils';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-16 px-4 md:px-16">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src="/logo.png" alt="Boulevard" className="h-8 w-8" />
                            <span className="text-2xl font-bold">Boulevard</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Your trusted partner in finding the perfect sustainable home. We connect eco-conscious buyers and renters with environmentally friendly properties.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaFacebookF size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaLinkedinIn size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/bookings" className="text-gray-400 hover:text-white transition-colors">Properties</Link></li>
                            <li><Link to="/my-bookings" className="text-gray-400 hover:text-white transition-colors">My Bookings</Link></li>
                            {!isAuthenticated() && (
                                <>
                                    <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                                    <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Services</h3>
                        <ul className="space-y-2">
                            <li><span className="text-gray-400">Property Search</span></li>
                            <li><span className="text-gray-400">Booking Management</span></li>
                            <li><span className="text-gray-400">Host Services</span></li>
                            <li><span className="text-gray-400">Payment Processing</span></li>
                            <li><span className="text-gray-400">24/7 Support</span></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <FaMapMarkerAlt className="text-orange-500" />
                                <span className="text-gray-400">123 Eco Street, Green City, GC 12345</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaPhone className="text-orange-500" />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaEnvelope className="text-orange-500" />
                                <span className="text-gray-400">info@boulevard.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Boulevard. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
