import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { popularListingsService } from '../services/popularListingsService.js';

const PopularListings = () => {
    const [page, setPage] = useState(0);
    const [listings, setListings] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch popular listings when component mounts or page changes
    useEffect(() => {
        const fetchPopularListings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await popularListingsService.getPopularListings(page, 6);
                setListings(data.listings || []);
                setPagination(data.pagination || {});
            } catch (err) {
                setError('Failed to load popular listings. Please try again later.');
                console.error('Error fetching popular listings:', err);
                // Fallback to empty state if API fails
                setListings([]);
                setPagination({});
            } finally {
                setLoading(false);
            }
        };

        fetchPopularListings();
    }, [page]);

    // Handle listing click - navigate to property details
    const handleListingClick = (listing) => {
        navigate(`/property/${listing._id}`, {
            state: {
                listing: {
                    ...listing,
                    price: `₹${listing.price.toLocaleString()}`,
                    name: listing.title,
                    address: listing.location,
                    img: listing.images[0] || '/listing1.png'
                }
            }
        });
    };

    // Loading state
    if (loading) {
        return (
            <section className="w-full py-16 px-4 md:px-16 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-5xl font-bold mb-2">Popular Listings</h2>
                        <p className="text-lg text-gray-500">
                            Explore latest and featured properties for sell, rent &amp; mortgage
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="w-full py-16 px-4 md:px-16 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-5xl font-bold mb-2">Popular Listings</h2>
                        <p className="text-lg text-gray-500">
                            Explore latest and featured properties for sell, rent &amp; mortgage
                        </p>
                    </div>
                </div>
                <div className="text-center py-16">
                    <p className="text-red-500 text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    const totalPages = pagination.totalPages || 3;
    const currentPage = pagination.currentPage || 0;

    return (
        <section className="w-full py-16 px-4 md:px-16 bg-white">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-5xl font-bold mb-2">Popular Listings</h2>
                    <p className="text-lg text-gray-500">
                        Explore latest and featured properties for sell, rent &amp; mortgage
                    </p>
                </div>
                <button
                    onClick={() => navigate('/bookings')}
                    className="border border-black rounded-full px-6 py-2 text-lg font-medium hover:bg-black hover:text-white transition duration-600"
                >
                    Explore All <span className="ml-1">↗</span>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {listings.map((listing, idx) => (
                    <div
                        key={listing._id || idx}
                        onClick={() => handleListingClick(listing)}
                        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    >
                        <img
                            src={listing.images[0] || '/listing1.png'}
                            alt={listing.title}
                            className="w-full h-56 object-cover"
                            onError={(e) => {
                                e.target.src = '/listing1.png';
                            }}
                        />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold">
                                    ₹{listing.price?.toLocaleString() || '0'}
                                    <span className="text-base font-normal text-gray-400">/month</span>
                                </span>
                                <button
                                    className="rounded-full border border-gray-300 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add to favorites functionality could go here
                                    }}
                                >
                                    ♥
                                </button>
                            </div>
                            <div className="text-xl font-semibold mb-1">{listing.title}</div>
                            <div className="text-gray-500 text-sm mb-4">{listing.location}</div>
                            <div className="flex items-center gap-4 text-gray-700 text-base mt-auto">
                                <span>{listing.beds || 1} Beds</span>
                                <span>{listing.baths || 1} Bathrooms</span>
                                <span>{listing.area || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
                <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0 || loading}
                    className={`rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition ${currentPage === 0 || loading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-100"
                        }`}
                >
                    &lt;
                </button>
                {[...Array(totalPages)].map((_, p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        disabled={loading}
                        className={`rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition ${currentPage === p
                            ? "bg-black text-white"
                            : loading
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}
                    >
                        {p + 1}
                    </button>
                ))}
                <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className={`rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition ${currentPage >= totalPages - 1 || loading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-100"
                        }`}
                >
                    &gt;
                </button>
            </div>

            {/* Display current page info */}
            {pagination.totalListings && (
                <div className="text-center mt-4 text-gray-500">
                    Showing {listings.length} of {pagination.totalListings} popular listings
                </div>
            )}
        </section>
    );
};

export default PopularListings;
