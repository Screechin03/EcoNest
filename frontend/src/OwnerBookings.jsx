import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const OwnerBookings = () => {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOwnerProperties();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchPropertyBookings(selectedProperty._id);
        }
    }, [selectedProperty]);

    const fetchOwnerProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_URL}/listings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch properties');

            // Filter properties owned by current user
            const user = JSON.parse(localStorage.getItem('user'));
            const ownedProperties = data.filter(property => property.owner._id === user.id);
            setProperties(ownedProperties);

            if (ownedProperties.length > 0) {
                setSelectedProperty(ownedProperties[0]);
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const fetchPropertyBookings = async (propertyId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/bookings/listing/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');
            setBookings(data);
        } catch (err) {
            setError(err.message);
            setBookings([]);
        }
    };

    const approveBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/bookings/${bookingId}/approve`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to approve booking');

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, status: 'confirmed' }
                    : booking
            ));
            alert('Booking approved successfully!');
        } catch (err) {
            alert('Error approving booking: ' + err.message);
        }
    };

    const rejectBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to reject this booking?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/bookings/${bookingId}/reject`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reject booking');

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, status: 'cancelled' }
                    : booking
            ));
            alert('Booking rejected successfully!');
        } catch (err) {
            alert('Error rejecting booking: ' + err.message);
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
                <div className="text-center">
                    <div className="text-gray-500">Loading your properties...</div>
                </div>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
                <div className="text-center py-12">
                    <h1 className="text-3xl font-bold text-green-700 mb-4">Property Bookings</h1>
                    <div className="text-gray-500 text-lg mb-4">
                        You don't have any properties listed yet
                    </div>
                    <button
                        onClick={() => navigate('/createListing')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
                    >
                        Create Your First Listing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-700 mb-4">Property Bookings</h1>
                <p className="text-gray-600">Manage bookings for your properties</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Properties Sidebar */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4">Your Properties</h2>
                    <div className="space-y-2">
                        {properties.map(property => (
                            <button
                                key={property._id}
                                onClick={() => setSelectedProperty(property)}
                                className={`w-full text-left p-3 rounded-lg border transition ${selectedProperty?._id === property._id
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-medium truncate">{property.title}</div>
                                <div className="text-sm text-gray-500 truncate">{property.location}</div>
                                <div className="text-sm font-medium text-green-600">
                                    ₹{property.price?.toLocaleString()}/night
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings Content */}
                <div className="lg:col-span-3">
                    {selectedProperty && (
                        <>
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <div className="flex items-center gap-4">
                                    {selectedProperty.images?.length > 0 && (
                                        <img
                                            src={selectedProperty.images[0]}
                                            alt={selectedProperty.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <h2 className="text-xl font-semibold">{selectedProperty.title}</h2>
                                        <p className="text-gray-600">{selectedProperty.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">
                                        Bookings ({bookings.length})
                                    </h3>
                                </div>

                                {bookings.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        No bookings found for this property
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {bookings.map(booking => (
                                            <div key={booking._id} className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {booking.user?.name || 'Guest'}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {booking.user?.email}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                        {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                                                    <div>
                                                        <p className="text-sm text-gray-500">Amount</p>
                                                        <p className="font-bold text-green-600">
                                                            ₹{booking.price?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => approveBooking(booking._id)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectBooking(booking._id)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-500 mt-2">
                                                    Booking ID: {booking._id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerBookings;
