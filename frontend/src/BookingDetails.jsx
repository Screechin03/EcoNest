import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaArrowLeft, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { API_URL } from './config';
import TagDisplay from './components/TagDisplay';
import TagCount from './components/TagCount';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_URL}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');

            const foundBooking = data.find(b => b._id === id);
            if (!foundBooking) {
                throw new Error('Booking not found');
            }
            setBooking(foundBooking);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const cancelBooking = async () => {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

            setBooking({ ...booking, status: 'cancelled' });
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
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10 mt-24">
                <div className="text-center">
                    <div className="text-gray-500">Loading booking details...</div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10 mt-24">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error || 'Booking not found'}
                </div>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded transition"
                >
                    Back to My Bookings
                </button>
            </div>
        );
    }

    const nights = calculateNights(booking.startDate, booking.endDate);

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 mt-24">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="text-green-600 hover:text-green-700 mb-4 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to My Bookings
                </button>
                <h1 className="text-3xl font-bold text-green-700 mb-2">Booking Details</h1>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className="text-gray-500">Booking ID: {booking._id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Property Information */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Property Information</h2>

                        {booking.listing?.images?.length > 0 && (
                            <div className="mb-4">
                                <img
                                    src={booking.listing.images[0]}
                                    alt={booking.listing.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {booking.listing?.title || 'Property'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {booking.listing?.location || 'Location not available'}
                        </p>

                        {booking.listing?.description && (
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600 text-sm">{booking.listing.description}</p>
                            </div>
                        )}

                        {booking.listing?.tags && booking.listing.tags.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="font-medium text-gray-900">Facilities</h4>
                                    <TagCount count={booking.listing.tags.length} size="sm" />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <TagDisplay
                                        tags={booking.listing.tags}
                                        size="sm"
                                        type="feature"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                            <button
                                onClick={() => navigate(`/listing/${booking.listing?._id}`)}
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                View Full Property Details →
                            </button>
                        </div>
                    </div>

                    {/* Booking Timeline */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Booking Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium">Booking Created</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(booking.startDate).toLocaleDateString()} - Initial booking request
                                    </p>
                                </div>
                            </div>

                            {booking.status === 'confirmed' && (
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium">Booking Confirmed</p>
                                        <p className="text-sm text-gray-500">Payment completed successfully</p>
                                    </div>
                                </div>
                            )}

                            {booking.status === 'cancelled' && (
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium">Booking Cancelled</p>
                                        <p className="text-sm text-gray-500">Booking was cancelled</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

                        <div className="space-y-4">
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
                                <p className="font-medium">{nights} nights</p>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{booking.price?.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ₹{Math.round(booking.price / nights).toLocaleString()} per night
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/listing/${booking.listing?._id}`)}
                                className="w-full px-4 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50 transition"
                            >
                                View Property
                            </button>

                            {booking.status === 'pending' && (
                                <button
                                    onClick={cancelBooking}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Cancel Booking
                                </button>
                            )}

                            <button
                                onClick={() => window.print()}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                            >
                                Print Details
                            </button>
                        </div>
                    </div>

                    {/* Contact Information */}
                    {booking.status === 'confirmed' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                For any questions about your booking, please contact our support team.
                            </p>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Email:</span> support@boulevard.com</p>
                                <p><span className="font-medium">Phone:</span> +91 98765 43210</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
