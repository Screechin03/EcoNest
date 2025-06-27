import React, { useState, useEffect } from 'react'
import { MdArrowRightAlt } from "react-icons/md";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import PopularListings from './utilities/PopularListings';
import PopularCities from './utilities/PopularCities';
import FeaturedListing from './utilities/FeaturedListing';
import { isAuthenticated } from './utils/AuthUtils';
import { API_URL } from './config';
const HomePage = () => {
    const [firstName, setFirstName] = useState('');
    const [searchParams, setSearchParams] = useState({
        location: '',
        propertyType: '',
        maxPrice: ''
    });
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Navigate to listings page with search parameters
        const queryParams = new URLSearchParams();
        if (searchParams.location) queryParams.append('location', searchParams.location);
        if (searchParams.propertyType) queryParams.append('type', searchParams.propertyType);
        if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);

        navigate(`/bookings?${queryParams.toString()}`);
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newsletterEmail }),
            });

            if (response.ok) {
                setNewsletterStatus('success');
                setNewsletterEmail('');
                setTimeout(() => setNewsletterStatus(''), 3000);
            } else {
                const data = await response.json();
                setNewsletterStatus('error');
                setTimeout(() => setNewsletterStatus(''), 3000);
            }
        } catch (error) {
            setNewsletterStatus('error');
            setTimeout(() => setNewsletterStatus(''), 3000);
        }
    };


    return (
        <div className="relative pt-28 px-7">
            <div className="relative w-full h-screen rounded-3xl shadow-lg overflow-hidden">
                <img
                    src="/home2.png"
                    alt="Home"
                    className="w-full h-screen object-cover rounded-3xl shadow-lg"
                />
                {/* Overlay Content */}
                <div className="absolute inset-x-2 bottom-0 flex flex-col md:flex-row items-center justify-between px-12 pb-8">
                    {/* Left: Heading and Button */}
                    <div className="text-white max-w-xl">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg mb-8">
                            Buy, Rent, & Sell<br />Property
                        </h1>
                        <button
                            onClick={() => navigate('/bookings')}
                            className="bg-white text-black rounded-full px-8 py-3 text-lg font-medium shadow hover:bg-gray-100 transition"
                        >
                            Explore All Property <span className="ml-2">↗</span>
                        </button>

                    </div>
                    {/* Right: Search Card */}
                    <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 w-full max-w-md md:mt-0 md:ml-auto mb-8 md:mb-0">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Find your Best Property<br />what do you want!</h2>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-1">Location</label>
                                <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                                    <span className="mr-2">📍</span>
                                    <input
                                        className="bg-transparent flex-1 outline-none"
                                        placeholder="Stockholm, Sweden"
                                        value={searchParams.location}
                                        onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-1">Property Type</label>
                                <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                                    <span className="mr-2">🏠</span>
                                    <input
                                        className="bg-transparent flex-1 outline-none"
                                        placeholder="Apartment, Villa, etc."
                                        value={searchParams.propertyType}
                                        onChange={(e) => setSearchParams({ ...searchParams, propertyType: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm mb-1">Max Price</label>
                                <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                                    <span className="mr-2">💲</span>
                                    <input
                                        type="number"
                                        className="bg-transparent flex-1 outline-none"
                                        placeholder="590.00 max"
                                        value={searchParams.maxPrice}
                                        onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-3 font-semibold text-lg transition">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <section className="w-full flex flex-col md:flex-row justify-between items-center gap-8 py-20 px-4 md:px-20 bg-white roboto-slab">
                {/* Left: Stats and Avatars */}
                <div>
                    <h2 className="text-5xl md:text-6xl font-bold text-neutral-700 mb-6 leading-tight">
                        1250+ Companies<br />Trust by us.
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                        <img src="/avatar1.png" alt="user1" className="w-10 h-10 rounded-full border-2 border-white -ml-0" />
                        <img src="/avatar2.png" alt="user2" className="w-10 h-10 rounded-full border-2 border-white -ml-3" />
                        <img src="/avatar3.png" alt="user3" className="w-10 h-10 rounded-full border-2 border-white -ml-3" />
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-extralight  -ml-3 border-2 border-white">+</div>
                    </div>
                    <div className="text-neutral-700 text-lg font-light">
                        <span className="underline underline-offset-4">13k+ rating <b>(4.7)</b></span>
                    </div>
                </div>
                <div className="hidden md:block ">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <line x1="40" y1="10" x2="40" y2="70" stroke="#F97316" strokeWidth="4" />
                        <line x1="10" y1="40" x2="70" y2="40" stroke="#F97316" strokeWidth="4" />
                        <line x1="20" y1="20" x2="60" y2="60" stroke="#F97316" strokeWidth="4" />
                        <line x1="60" y1="20" x2="20" y2="60" stroke="#F97316" strokeWidth="4" />
                    </svg>
                </div>
                {/* Right: Description and Buttons */}
                <div className="flex-1 flex flex-col items-start md:items-end">
                    <p className="text-xl md:text-2xl text-neutral-700 mb-8 max-w-xl text-left">
                        Your leading real estate advocate, transforming houses into dreams. Trust us to expertly guide you home. 45,000 apartments &amp; home for sell, rent &amp; mortgage.
                    </p>
                    <div className="flex justify-between items-center gap-6">

                        <button
                            onClick={() => navigate('/bookings')}
                            className="bg-black text-white rounded-full px-8 py-3 text-lg font-semibold shadow hover:bg-gray-900 transition"
                        >
                            More Listing
                        </button>
                        <button className="flex items-center justify-center gap-1 text-neutral-700 text-lg font-medium hover:underline">
                            Request a Callback
                            <MdArrowRightAlt />
                        </button>
                    </div>
                </div>
                {/* Orange star */}

            </section>
            <PopularListings />
            <PopularCities />
            <FeaturedListing />

            {/* Newsletter Section */}
            <section className="w-full py-20 px-4 md:px-16 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Stay Updated with Latest Properties
                    </h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Get exclusive access to new listings, market insights, and special offers delivered directly to your inbox.
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                            >
                                Subscribe
                            </button>
                        </div>
                        {newsletterStatus === 'success' && (
                            <p className="text-white mt-4">Thank you for subscribing!</p>
                        )}
                        {newsletterStatus === 'error' && (
                            <p className="text-orange-200 mt-4">Something went wrong. Please try again.</p>
                        )}
                    </form>
                    <p className="text-orange-200 text-sm mt-4">
                        Join 10,000+ property enthusiasts already subscribed
                    </p>
                </div>
            </section>



        </div>
    )
}

export default HomePage