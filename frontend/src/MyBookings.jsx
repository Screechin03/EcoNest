import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaChartLine, FaFilter, FaTimesCircle, FaMapMarkerAlt, FaCheckCircle, FaRegClock, FaTimes, FaInfoCircle, FaExclamationCircle, FaSearch } from 'react-icons/fa';
import TagDisplay from './components/TagDisplay';
import TagCount from './components/TagCount';
import { API_URL } from './config';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const getBookingStats = () => {
        const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            upcoming: bookings.filter(b =>
                b.status === 'confirmed' && new Date(b.startDate) > new Date()
            ).length,
            totalSpent: Math.round(bookings
                .filter(b => b.status === 'confirmed')
                .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0)
            )
        };
        return stats;
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/login');
                return;
            }

            setLoading(true);
            setError('');

            console.log('Fetching bookings with token');
            const res = await fetch(`${API_URL}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                // Token is invalid or expired
                console.log('Token invalid or expired, clearing and redirecting');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to fetch bookings (Status: ${res.status})`);
            }

            const data = await res.json();
            console.log(`Fetched ${data.length} bookings`);
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, status: 'cancelled' }
                    : booking
            ));

            alert(data.message + (data.refund ? '. ' + data.refund : ''));
        } catch (err) {
            alert('Error cancelling booking: ' + err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✅';
            case 'cancelled': return '❌';
            default: return '❓';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const filteredBookings = bookings.filter(booking =>
        filterStatus === 'all' || booking.status === filterStatus
    );

    const stats = getBookingStats();

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
                <div className="text-center">
                    <div className="text-gray-500">Loading your bookings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-700 mb-4">My Bookings</h1>
                <p className="text-gray-600">Manage your property bookings and reservations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <FaChartLine className="text-2xl text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                        </div>
                        <FaCheckCircle className="text-2xl text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Upcoming</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
                        </div>
                        <FaRegClock className="text-2xl text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</p>
                        </div>
                        <FaCalendarAlt className="text-2xl text-purple-500" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                    <FaTimesCircle />
                    {error}
                </div>
            )}

            {/* Enhanced Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaFilter className="text-green-600" />
                        Filter Bookings
                    </h3>
                    <span className="text-sm text-gray-500">
                        {filteredBookings.length} of {bookings.length} bookings
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* All Bookings Filter Button */}
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={filterStatus === 'all'
                            ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-600 text-white shadow-md"
                            : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}
                    >
                        <FaChartLine />
                        All Bookings
                        <span className={filterStatus === 'all'
                            ? "ml-1 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20"
                            : "ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100"}>
                            {stats.total || 0}
                        </span>
                    </button>

                    {/* Pending Filter Button */}
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={filterStatus === 'pending'
                            ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-yellow-600 text-white shadow-md"
                            : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"}
                    >
                        <FaRegClock />
                        Pending
                        <span className={filterStatus === 'pending'
                            ? "ml-1 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20"
                            : "ml-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100"}>
                            {stats.pending || 0}
                        </span>
                    </button>

                    {/* Confirmed Filter Button */}
                    <button
                        onClick={() => setFilterStatus('confirmed')}
                        className={filterStatus === 'confirmed'
                            ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-green-600 text-white shadow-md"
                            : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}
                    >
                        <FaCheckCircle />
                        Confirmed
                        <span className={filterStatus === 'confirmed'
                            ? "ml-1 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20"
                            : "ml-1 px-2 py-0.5 rounded-full text-xs bg-green-100"}>
                            {stats.confirmed || 0}
                        </span>
                    </button>

                    {/* Cancelled Filter Button */}
                    <button
                        onClick={() => setFilterStatus('cancelled')}
                        className={filterStatus === 'cancelled'
                            ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-red-600 text-white shadow-md"
                            : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"}
                    >
                        <FaTimesCircle />
                        Cancelled
                        <span className={filterStatus === 'cancelled'
                            ? "ml-1 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20"
                            : "ml-1 px-2 py-0.5 rounded-full text-xs bg-red-100"}>
                            {stats.cancelled || 0}
                        </span>
                    </button>
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">
                        {filterStatus === 'all'
                            ? 'No bookings found. You need to make a booking first.'
                            : `No ${filterStatus} bookings found. Try changing the filter or make a new booking.`
                        }
                    </div>
                    <p className="text-gray-600 mb-6">
                        To create a booking, browse available properties and select "Book Now" on any listing.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition mr-4"
                    >
                        Browse Properties
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredBookings.map(booking => (
                        <div
                            key={booking._id}
                            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                        >
                            <div className="md:flex">
                                {/* Property Image */}
                                <div className="md:w-48 h-48 md:h-auto">
                                    {booking.listing?.images?.length > 0 ? (
                                        <img
                                            src={booking.listing.images[0]}
                                            alt={booking.listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                {booking.listing?.title || 'Property'}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {booking.listing?.location || 'Location not available'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Check-in</p>
                                            <p className="font-medium">{formatDate(booking.startDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Check-out</p>
                                            <p className="font-medium">{formatDate(booking.endDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="font-medium">
                                                {calculateNights(booking.startDate, booking.endDate)} nights
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-xl font-bold text-green-600">
                                                ₹{booking.price?.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/booking/${booking._id}`)}
                                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/listing/${booking.listing?._id}`)}
                                                className="px-4 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50 transition"
                                            >
                                                View Property
                                            </button>
                                            {booking.status === 'pending' && (
                                                <button
                                                    onClick={() => cancelBooking(booking._id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                            {booking.status === 'confirmed' && new Date(booking.endDate) < new Date() && (
                                                <button
                                                    onClick={() => navigate(`/listing/${booking.listing?._id}#reviews`)}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                                                >
                                                    Leave Review
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    {booking.listing?.tags && booking.listing.tags.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="text-sm text-gray-500">Facilities</p>
                                                <TagCount count={booking.listing.tags.length} size="sm" />
                                            </div>
                                            <TagDisplay
                                                tags={booking.listing.tags}
                                                limit={4}
                                                size="sm"
                                                type="outline"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Back to Browse Button */}
            <div className="text-center mt-8">
                <button
                    onClick={() => navigate('/bookings')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded transition"
                >
                    Browse More Properties
                </button>
            </div>
        </div>
    );
};

export default MyBookings;
