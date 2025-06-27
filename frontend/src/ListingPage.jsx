import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaImages, FaChartLine, FaTimes, FaSave, FaHome, FaTags, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from './config';
import TagDisplay from './components/TagDisplay';
import TagCount from './components/TagCount';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to get query param
const useQuery = () => new URLSearchParams(useLocation().search);

// Helper to format relative time
const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
};

// Helper to get coordinates from location string
const getCoordinatesFromLocation = (location) => {
    // Simple geocoding for common Indian cities (in a real app, use a proper geocoding service)
    const locationMap = {
        'mumbai': [19.0760, 72.8777],
        'delhi': [28.6139, 77.2090],
        'bangalore': [12.9716, 77.5946],
        'chennai': [13.0827, 80.2707],
        'hyderabad': [17.3850, 78.4867],
        'pune': [18.5204, 73.8567],
        'kolkata': [22.5726, 88.3639],
        'ahmedabad': [23.0225, 72.5714],
        'jaipur': [26.9124, 75.7873],
        'surat': [21.1702, 72.8311],
    };

    const locationLower = location.toLowerCase();
    for (const [city, coords] of Object.entries(locationMap)) {
        if (locationLower.includes(city)) {
            return coords;
        }
    }

    // Default to Mumbai if location not found
    return [19.0760, 72.8777];
};

const ListingPage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [form, setForm] = useState({ title: '', price: '', location: '', tags: '', description: '' });
    const [stats, setStats] = useState({ total: 0, views: 0, inquiries: 0 });
    const [formValidation, setFormValidation] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [propertyBookings, setPropertyBookings] = useState({}); // Store bookings for each property
    const [showBookingOverlay, setShowBookingOverlay] = useState(null); // Track which property's overlay is shown
    const query = useQuery();
    const searchTerm = query.get('search')?.toLowerCase() || '';

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/listings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch listings');

                const userId = JSON.parse(localStorage.getItem('user'))?.id;
                const userListings = data.filter(listing => listing.owner._id === userId);

                // Filter listings locally based on title, price, tags
                const filtered = userListings.filter(listing => {
                    return (
                        listing.title?.toLowerCase().includes(searchTerm) ||
                        listing.location?.toLowerCase().includes(searchTerm) ||
                        listing.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                        String(listing.price).includes(searchTerm)
                    );
                });

                setListings(filtered);

                // Fetch bookings for each property
                await fetchPropertyBookings(filtered, token);

                // Calculate stats
                const totalViews = filtered.reduce((sum, listing) => sum + (listing.views || 0), 0);
                const totalInquiries = filtered.reduce((sum, listing) => sum + (listing.inquiries || 0), 0);
                setStats({
                    total: filtered.length,
                    views: totalViews,
                    inquiries: totalInquiries
                });
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        fetchListings();
    }, [searchTerm]);

    // Function to fetch bookings for properties
    const fetchPropertyBookings = async (properties, token) => {
        try {
            const bookingsMap = {};

            // Fetch bookings for each property
            for (const property of properties) {
                try {
                    const bookingRes = await fetch(`${API_URL}/bookings/property/${property._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (bookingRes.ok) {
                        const bookings = await bookingRes.json();
                        // Filter confirmed bookings only
                        const confirmedBookings = bookings.filter(booking =>
                            booking.status === 'confirmed' || booking.status === 'pending'
                        );
                        bookingsMap[property._id] = confirmedBookings;
                    } else {
                        bookingsMap[property._id] = [];
                    }
                } catch (err) {
                    console.error(`Failed to fetch bookings for property ${property._id}:`, err);
                    bookingsMap[property._id] = [];
                }
            }

            setPropertyBookings(bookingsMap);
        } catch (err) {
            console.error('Failed to fetch property bookings:', err);
        }
    };

    // Function to format date range for display
    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startStr = start.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        });
        const endStr = end.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
        });
        return `${startStr} - ${endStr}`;
    };

    // Function to check if property has bookings
    const hasBookings = (propertyId) => {
        return propertyBookings[propertyId] && propertyBookings[propertyId].length > 0;
    };

    const handleCardClick = (listing) => {
        setSelectedListing(listing);
        setForm({
            title: listing.title,
            price: listing.price,
            location: listing.location,
            tags: listing.tags.join(', '),
            description: listing.description || '',
            ownerEmail: listing.owner?.email || '',
            ownerPhone: listing.owner?.phone || '',
        });
        setFormValidation({});
    };

    const validateForm = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'Title is required';
        if (!form.price || form.price <= 0) errors.price = 'Valid price is required';
        if (!form.location.trim()) errors.location = 'Location is required';
        if (!form.description.trim()) errors.description = 'Description is required';

        setFormValidation(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validateForm()) {
            return;
        }

        setUpdateLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/listings/${selectedListing._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    price: parseInt(form.price, 10),
                    tags: form.tags.split(',').map(tag => tag.trim()),
                }),
            });

            if (!res.ok) throw new Error('Failed to update listing');
            const updated = await res.json();

            setListings(prev =>
                prev.map(listing => (listing._id === updated._id ? updated : listing))
            );
            setSelectedListing(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            return;
        }

        setDeleteLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/listings/${selectedListing._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to delete listing');

            setListings(prev => prev.filter(listing => listing._id !== selectedListing._id));
            setSelectedListing(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Clear validation error for this field
        if (formValidation[name]) {
            setFormValidation(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Close overlay when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showBookingOverlay && !event.target.closest('.booking-overlay-container')) {
                setShowBookingOverlay(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBookingOverlay]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 mt-24">
            {/* Header with Statistics */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Property Listings</h1>
                        <p className="text-gray-600">Manage and track your property portfolio</p>
                    </div>
                    <Link
                        to="/createListing"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold"
                    >
                        <span>+</span> Add New Property
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Properties</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <FaChartLine className="text-3xl text-blue-200" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Views</p>
                                <p className="text-3xl font-bold">{stats.views}</p>
                            </div>
                            <FaEye className="text-3xl text-green-200" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Inquiries</p>
                                <p className="text-3xl font-bold">{stats.inquiries}</p>
                            </div>
                            <FaCalendarAlt className="text-3xl text-purple-200" />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Loading your properties...</span>
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-20">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl text-gray-300 mb-6">🏠</div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Properties Yet</h3>
                        <p className="text-gray-600 mb-8">
                            Start building your property portfolio and reach potential tenants worldwide.
                        </p>
                        <Link
                            to="/createListing"
                            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-semibold"
                        >
                            <span>+</span> Create Your First Listing
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <div
                            key={listing._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="relative h-56 w-full group">
                                {listing.images?.length > 0 ? (
                                    <div className="flex h-56 overflow-x-auto space-x-2 scroll-smooth scrollbar-hide">
                                        {listing.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${listing.title}-${idx}`}
                                                className="h-56 w-full object-cover flex-shrink-0"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                                        <FaImages className="text-4xl" />
                                        <span className="ml-2">No Images</span>
                                    </div>
                                )}

                                {/* Image count badge */}
                                {listing.images?.length > 0 && (
                                    <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                        <FaImages />
                                        {listing.images.length}
                                    </div>
                                )}

                                {/* Booking Status Badge - Show if property has bookings */}
                                {hasBookings(listing._id) && (
                                    <div className="absolute top-3 left-3 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowBookingOverlay(
                                                    showBookingOverlay === listing._id ? null : listing._id
                                                );
                                            }}
                                            className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1"
                                        >
                                            <FaCalendarAlt />
                                            {propertyBookings[listing._id]?.length} Booking{propertyBookings[listing._id]?.length !== 1 ? 's' : ''}
                                        </button>
                                    </div>
                                )}

                                {/* Booking Dates Overlay */}
                                {showBookingOverlay === listing._id && hasBookings(listing._id) && (
                                    <div className="absolute inset-0 bg-black bg-opacity-80 z-30 flex items-center justify-center p-4">
                                        <div className="booking-overlay-container bg-white rounded-lg p-4 max-w-xs w-full max-h-48 overflow-y-auto">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-1">
                                                    <FaCalendarAlt className="text-green-600" />
                                                    Booked Dates
                                                </h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowBookingOverlay(null);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {propertyBookings[listing._id]?.map((booking, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="border border-gray-200 rounded-lg p-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {formatDateRange(booking.startDate, booking.endDate)}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                        {booking.user && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Guest: {booking.user.name || booking.user.email}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            ₹{booking.price?.toLocaleString() || 'N/A'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 text-center">
                                                    Total Revenue: ₹{propertyBookings[listing._id]
                                                        ?.filter(b => b.status === 'confirmed')
                                                        ?.reduce((sum, b) => sum + (b.price || 0), 0)
                                                        ?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(listing);
                                            }}
                                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
                                            title="Edit Listing"
                                        >
                                            <FaEdit />
                                        </button>
                                        <Link
                                            to={`/listing/${listing._id}`}
                                            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Price and Status */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center text-2xl font-bold text-green-600">
                                        ₹
                                        {listing.price.toLocaleString()}
                                        <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'rented' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {listing.status || 'Active'}
                                        </span>
                                        {hasBookings(listing._id) && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                {propertyBookings[listing._id]?.length} Active Booking{propertyBookings[listing._id]?.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Title and Location */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{listing.title}</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                                    <span className="text-sm">{listing.location}</span>
                                </div>

                                {/* Tags */}
                                {listing.tags?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TagCount count={listing.tags.length} size="sm" />
                                        </div>
                                        <TagDisplay
                                            tags={listing.tags}
                                            limit={3}
                                            size="sm"
                                            type="outline"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Stats Row */}
                            <div className="border-t pt-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-gray-800">{listing.views || 0}</div>
                                    <div className="text-xs text-gray-500">Views</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-800">{listing.inquiries || 0}</div>
                                    <div className="text-xs text-gray-500">Inquiries</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Listed</div>
                                    <div className="text-xs font-semibold text-gray-700">
                                        {formatRelativeTime(listing.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Enhanced Modal */}
            {selectedListing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaEdit className="text-xl" />
                                    <h2 className="text-2xl font-bold">Edit Property</h2>
                                </div>
                                <button
                                    className="text-white hover:text-red-300 text-2xl transition-colors"
                                    onClick={() => setSelectedListing(null)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <p className="text-blue-100 mt-2">Update your property information</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Property Images Preview */}
                            {selectedListing.images?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <FaImages className="text-green-600" />
                                        Property Images ({selectedListing.images.length})
                                    </h4>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {selectedListing.images.slice(0, 4).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Property ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                                            />
                                        ))}
                                        {selectedListing.images.length > 4 && (
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                                                +{selectedListing.images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Property Details Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaHome className="text-green-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Property Details</h3>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Property Title *
                                    </label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formValidation.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter property title"
                                    />
                                    {formValidation.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span> {formValidation.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${formValidation.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Describe your property..."
                                    />
                                    {formValidation.description && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span> {formValidation.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price and Location Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ₹
                                            Monthly Rent *
                                        </label>
                                        <input
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            type="number"
                                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formValidation.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter amount"
                                        />
                                        {formValidation.price && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <span>⚠️</span> {formValidation.price}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaMapMarkerAlt className="inline mr-1 text-red-500" />
                                            Location *
                                        </label>
                                        <input
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formValidation.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            placeholder="City, Area, Landmark"
                                        />
                                        {formValidation.location && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <span>⚠️</span> {formValidation.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaTags className="inline mr-1 text-purple-600" />
                                        Property Features
                                    </label>
                                    <input
                                        name="tags"
                                        value={form.tags}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="Separate features with commas"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Example: Pet-friendly, Parking, Garden, AC, WiFi
                                    </p>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaUser className="text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaEnvelope className="inline mr-1 text-blue-600" />
                                            Email Address
                                        </label>
                                        <input
                                            name="ownerEmail"
                                            value={form.ownerEmail}
                                            onChange={handleChange}
                                            type="email"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="Contact email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaPhone className="inline mr-1 text-green-600" />
                                            Phone Number
                                        </label>
                                        <input
                                            name="ownerPhone"
                                            value={form.ownerPhone}
                                            onChange={handleChange}
                                            type="tel"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="Contact phone"
                                        />
                                    </div>
                                </div>

                                {selectedListing.owner?.phone && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            <strong>Registered Phone:</strong> {selectedListing.owner.phone}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Property Location Map */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaMapMarkerAlt className="text-red-500" />
                                    <h3 className="text-lg font-semibold text-gray-800">Property Location</h3>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">{selectedListing.location}</p>
                                </div>

                                <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                                    <MapContainer
                                        center={getCoordinatesFromLocation(selectedListing.location)}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={getCoordinatesFromLocation(selectedListing.location)}>
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>{selectedListing.title}</strong>
                                                    <br />
                                                    <span className="text-sm text-gray-600">{selectedListing.location}</span>
                                                    <br />
                                                    <span className="text-green-600 font-semibold">₹{selectedListing.price?.toLocaleString()}/month</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    * Approximate location based on area information
                                </p>
                            </div>

                            {/* Property Stats */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Property Performance</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-blue-600">{selectedListing.views || 0}</div>
                                        <div className="text-xs text-gray-500">Views</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-green-600">{selectedListing.inquiries || 0}</div>
                                        <div className="text-xs text-gray-500">Inquiries</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-purple-600">
                                            {formatRelativeTime(selectedListing.createdAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">Listed</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-between">
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FaTrash />
                                        Delete Listing
                                    </>
                                )}
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedListing(null)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updateLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingPage;
