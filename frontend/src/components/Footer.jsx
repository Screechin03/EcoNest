import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { isAuthenticated } from '../utils/AuthUtils';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-8 px-4 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    {/* Company Info */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <img src="/logo.png" alt="Boulevard" className="h-6 w-6" />
                            <span className="text-xl font-bold">Boulevard</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Your trusted partner in finding perfect sustainable homes.
                        </p>
                        <div className="flex space-x-3">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaFacebookF size={16} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaTwitter size={16} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaInstagram size={16} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <FaLinkedinIn size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold">Quick Links</h3>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/bookings" className="text-gray-400 hover:text-white transition-colors">Properties</Link></li>
                            <li><Link to="/my-bookings" className="text-gray-400 hover:text-white transition-colors">My Bookings</Link></li>
                            {!isAuthenticated() && (
                                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login/Register</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold">Services</h3>
                        <ul className="space-y-1 text-sm">
                            <li><span className="text-gray-400">Property Search</span></li>
                            <li><span className="text-gray-400">Booking Management</span></li>
                            <li><span className="text-gray-400">Host Services</span></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold">Contact</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                                <FaMapMarkerAlt className="text-orange-500" size={14} />
                                <span className="text-gray-400">123 Eco Street, Green City</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaPhone className="text-orange-500" size={14} />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaEnvelope className="text-orange-500" size={14} />
                                <span className="text-gray-400">info@boulevard.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-xs">
                            © {currentYear} Boulevard. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-2 md:mt-0 text-xs">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
