import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, bookingUtils } from './services/bookingService.js';
import { FaCalendarAlt, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Calendar component for booking visualization
const BookingCalendar = ({ bookings }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks

    for (let day = new Date(startDate); day < endDate; day.setDate(day.getDate() + 1)) {
        days.push(new Date(day));
    }

    const getBookingsForDate = (date) => {
        return bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            const checkDate = new Date(date);
            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-600" />
                    Booking Calendar
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="font-medium text-gray-700 min-w-[120px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === month;
                    const isToday = day.toDateString() === today.toDateString();
                    const dayBookings = getBookingsForDate(day);
                    const hasBookings = dayBookings.length > 0;

                    return (
                        <div
                            key={index}
                            className={`
                                p-2 min-h-[40px] text-center text-sm border rounded-lg transition
                                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                                ${isToday ? 'bg-blue-100 border-blue-300 font-bold' : 'border-gray-100'}
                                ${hasBookings ? 'bg-green-50 border-green-200' : ''}
                            `}
                        >
                            <div className="font-medium">{day.getDate()}</div>
                            {hasBookings && (
                                <div className="flex flex-col gap-1 mt-1">
                                    {dayBookings.slice(0, 2).map(booking => (
                                        <div
                                            key={booking._id}
                                            className={`
                                                text-xs px-1 py-0.5 rounded text-white
                                                ${booking.status === 'confirmed' ? 'bg-green-500' :
                                                    booking.status === 'pending' ? 'bg-yellow-500' :
                                                        'bg-red-500'}
                                            `}
                                            title={booking.listing?.title || 'Booking'}
                                        >
                                            {booking.listing?.title?.substring(0, 8) || 'Booking'}...
                                        </div>
                                    ))}
                                    {dayBookings.length > 2 && (
                                        <div className="text-xs text-gray-600">
                                            +{dayBookings.length - 2} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    );
};

const BookingSummary = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookingsSummary();
    }, []);

    const fetchBookingsSummary = async () => {
        try {
            const bookingsData = await bookingAPI.getUserBookings();
            setBookings(bookingsData);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const getBookingStats = () => {
        const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            upcoming: bookings.filter(b =>
                b.status === 'confirmed' && bookingUtils.isBookingUpcoming(b.startDate)
            ).length,
            totalSpent: bookings
                .filter(b => b.status === 'confirmed')
                .reduce((sum, b) => sum + (b.price || 0), 0)
        };
        return stats;
    };

    const getUpcomingBookings = () => {
        return bookings
            .filter(b => b.status === 'confirmed' && bookingUtils.isBookingUpcoming(b.startDate))
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 3);
    };

    const getRecentBookings = () => {
        return bookings
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 3);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
                <div className="text-center">
                    <div className="text-gray-500">Loading booking summary...</div>
                </div>
            </div>
        );
    }

    const stats = getBookingStats();
    const upcomingBookings = getUpcomingBookings();
    const recentBookings = getRecentBookings();

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-700 mb-4">Booking Dashboard</h1>
                <p className="text-gray-600">Overview of your travel bookings and reservations</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Upcoming</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 10v6m11-7h-6m-10 0H1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Bookings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Upcoming Trips</h2>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="text-green-600 hover:text-green-700 text-sm"
                        >
                            View All →
                        </button>
                    </div>

                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 4h6M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
                            </svg>
                            <p>No upcoming trips</p>
                            <button
                                onClick={() => navigate('/bookings')}
                                className="mt-2 text-green-600 hover:text-green-700"
                            >
                                Book your next stay
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingBookings.map(booking => (
                                <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {booking.listing?.title || 'Property'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {booking.listing?.location}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {bookingUtils.formatDate(booking.startDate)} - {bookingUtils.formatDate(booking.endDate)}
                                            </p>
                                        </div>
                                        <span className="text-sm text-green-600 font-medium">
                                            {bookingUtils.calculateDaysUntilCheckin(booking.startDate)} days
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Recent Bookings</h2>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="text-green-600 hover:text-green-700 text-sm"
                        >
                            View All →
                        </button>
                    </div>

                    {recentBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No bookings yet</p>
                            <button
                                onClick={() => navigate('/bookings')}
                                className="mt-2 text-green-600 hover:text-green-700"
                            >
                                Make your first booking
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBookings.map(booking => (
                                <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {booking.listing?.title || 'Property'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {booking.listing?.location}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {bookingUtils.formatDate(booking.startDate)}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bookingUtils.getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Calendar */}
            <div className="mt-8">
                <BookingCalendar bookings={bookings} />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/bookings')}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-center transition"
                >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="font-medium">Browse Properties</div>
                    <div className="text-sm opacity-90">Find your next stay</div>
                </button>

                <button
                    onClick={() => navigate('/my-bookings')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-center transition"
                >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div className="font-medium">My Bookings</div>
                    <div className="text-sm opacity-90">Manage reservations</div>
                </button>

                <button
                    onClick={() => navigate('/owner-bookings')}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-center transition"
                >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="font-medium">Manage Properties</div>
                    <div className="text-sm opacity-90">Handle guest bookings</div>
                </button>
            </div>
        </div>
    );
};

export default BookingSummary;
