import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from './services/bookingService.js';
import { FaCheckCircle, FaSpinner, FaCreditCard, FaCalendarAlt, FaMapMarkerAlt, FaHome } from 'react-icons/fa';    // Success Animation Component
const SuccessAnimation = ({ bookingDetails }) => {
    // Format the price correctly based on available data
    const formatPrice = () => {
        // Check all possible price fields in order of priority
        const price = bookingDetails.totalAmount || bookingDetails.price || amount;
        if (!price && price !== 0) return 'N/A';
        return `₹${Number(price).toLocaleString()}`;
    };

    console.log("Booking details in success animation:", bookingDetails);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* Success Animation */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                        <FaCheckCircle className="text-4xl text-green-600 animate-bounce" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">Your payment was successful and your booking has been confirmed.</p>

                {/* Booking Details */}
                {bookingDetails && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaHome className="text-green-600" />
                            Booking Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-gray-600">Property:</span>
                                <span className="font-medium text-right" style={{ maxWidth: '60%' }}>{bookingDetails.listing?.title || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium text-right" style={{ maxWidth: '60%' }}>{bookingDetails.listing?.location || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium">{new Date(bookingDetails.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="font-medium">{new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-gray-800">Total Amount:</span>
                                <span className="text-green-600">{formatPrice()}</span>
                            </div>
                            {bookingDetails.totalAmount === undefined && bookingDetails.price === undefined && (
                                <div className="mt-2 text-xs text-orange-500">
                                    Note: Using estimated amount from original booking
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-500 mb-4">
                    You will be redirected to your bookings in a few seconds...
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.href = '/my-bookings'}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => window.location.href = '/bookings'}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        Book More
                    </button>
                </div>
            </div>
        </div>
    );
};

const PaymentPage = ({ bookingId, amount }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/my-bookings');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const fetchBookingDetails = async () => {
        try {
            const details = await bookingAPI.getBookingDetails(bookingId);
            setBookingDetails(details);
        } catch (err) {
            console.error('Failed to fetch booking details:', err);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Create payment order
            const order = await paymentAPI.createPaymentOrder(amount);

            // Add a delay with loading animation to improve UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            const razorpayKey = import.meta.env.VITE_APP_RAZORPAY_KEY_ID || "rzp_test_CfHijwdCzAevEK";
            const options = {
                key: razorpayKey,
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Confirm all bookings with the same payment order (handles multiple rooms)
                        const confirmedPayment = await bookingAPI.confirmPaymentOrder(bookingId, {
                            paymentId: response.razorpay_payment_id,
                        });

                        // Set booking details to the first confirmed booking for display
                        const firstBooking = confirmedPayment.bookings?.[0] || {};

                        // Add totalAmount from server response if available
                        if (confirmedPayment.totalAmount) {
                            firstBooking.totalAmount = confirmedPayment.totalAmount;
                        }

                        // Log to check if total amount is coming through correctly
                        console.log("Payment confirmation response:", confirmedPayment);
                        console.log("First booking with total amount:", firstBooking);

                        setBookingDetails(firstBooking);

                        // Show success message with multiple booking info
                        const totalBookings = confirmedPayment.totalBookings || 1;
                        setSuccess(`Payment successful! ${totalBookings} booking${totalBookings > 1 ? 's' : ''} confirmed.`);
                    } catch (err) {
                        setError('Payment was successful but booking confirmation failed: ' + err.message);
                        // Cleanup pending booking on failure
                        try {
                            await bookingAPI.markPaymentFailed(bookingId);
                        } catch (cleanupErr) {
                            console.error('Failed to cleanup pending booking:', cleanupErr);
                        }
                    }
                },
                modal: {
                    ondismiss: async function () {
                        // Payment modal was closed without completion
                        setError('Payment was cancelled. Please try again.');
                        // Cleanup pending booking
                        try {
                            await bookingAPI.markPaymentFailed(bookingId);
                        } catch (cleanupErr) {
                            console.error('Failed to cleanup pending booking:', cleanupErr);
                        }
                    }
                },
                prefill: {
                    email: JSON.parse(localStorage.getItem('user'))?.email || '',
                },
                theme: { color: '#38a169' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="max-w-2xl mx-auto mt-24 p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCreditCard className="text-2xl text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
                        <p className="text-gray-600">Secure payment powered by Razorpay</p>
                    </div>

                    {/* Booking Summary */}
                    {bookingDetails && (
                        <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaHome className="text-blue-600" />
                                Booking Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600">Property:</span>
                                    <span className="font-medium text-right">{bookingDetails.listing?.title || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        Location:
                                    </span>
                                    <span className="font-medium text-right" style={{ maxWidth: '60%' }}>{bookingDetails.listing?.location || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <FaCalendarAlt className="text-green-600" />
                                        Check-in:
                                    </span>
                                    <span className="font-medium">{new Date(bookingDetails.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <FaCalendarAlt className="text-red-600" />
                                        Check-out:
                                    </span>
                                    <span className="font-medium">{new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg text-gray-700">Total Amount:</span>
                            <span className="text-2xl font-bold text-green-600">₹{amount?.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            This amount includes all taxes and fees
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Success Message (replaced by modal) */}
                    {success && !bookingDetails && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-400 mr-2" />
                                <span className="text-green-700">{success}</span>
                            </div>
                        </div>
                    )}

                    {/* Waiting Animation */}
                    {loading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
                                <p className="text-blue-800 font-medium">Preparing your payment gateway...</p>
                                <p className="text-blue-600 text-sm mt-2">Please wait, you'll be redirected shortly</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Button */}
                    <form onSubmit={e => { e.preventDefault(); handlePayment(); }}>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2 ${loading || success
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                                } text-white`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span className="relative">
                                        Processing Payment
                                        <span className="absolute inline-flex">
                                            <span className="animate-ping-slow">.</span>
                                            <span className="animate-ping-slow animation-delay-300">.</span>
                                            <span className="animate-ping-slow animation-delay-600">.</span>
                                        </span>
                                    </span>
                                </>
                            ) : success ? (
                                <>
                                    <FaCheckCircle />
                                    Payment Completed ✓
                                </>
                            ) : (
                                <>
                                    <FaCreditCard />
                                    Pay Securely with Razorpay
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            🔒 Your payment information is secure and encrypted
                        </p>
                    </div>

                    {/* Back Button */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/bookings')}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ← Back to Properties
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Animation Modal */}
            {success && bookingDetails && (
                <SuccessAnimation bookingDetails={bookingDetails} />
            )}
        </>
    );
};

export default PaymentPage;