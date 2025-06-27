// Centralized booking API service
import { API_URL } from '../config';

const API_BASE_URL = API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

export const bookingAPI = {
    // Get user's bookings
    getUserBookings: async () => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch bookings');
        }

        return response.json();
    },

    // Get bookings for a specific listing (owner only)
    getListingBookings: async (listingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/listing/${listingId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch listing bookings');
        }

        return response.json();
    },

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create booking');
        }

        return response.json();
    },

    // Cancel/Delete a booking
    cancelBooking: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel booking');
        }

        return response.json();
    },

    // Approve a booking (owner only)
    approveBooking: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to approve booking');
        }

        return response.json();
    },

    // Reject a booking (owner only)
    rejectBooking: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to reject booking');
        }

        return response.json();
    },

    // Confirm booking with payment (used in PaymentPage)
    confirmBooking: async (bookingId, paymentData) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to confirm booking');
        }

        return response.json();
    },

    // Confirm all bookings with the same payment order (for multiple rooms)
    confirmPaymentOrder: async (bookingId, paymentData) => {
        console.log('Making request to:', `${API_BASE_URL}/bookings/${bookingId}/confirm-payment-order`);
        console.log('Payment data:', paymentData);

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm-payment-order`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            console.log('Content type:', contentType);

            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to confirm payment order');
            } else {
                const text = await response.text();
                console.log('Non-JSON response:', text);
                throw new Error(`Server error (${response.status}): ${text.substring(0, 200)}`);
            }
        }

        return response.json();
    },

    // Mark payment as failed and cleanup pending booking
    markPaymentFailed: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/payment-failed`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cleanup failed payment');
        }

        return response.json();
    },

    // Get booking details
    getBookingDetails: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch booking details');
        }

        return response.json();
    }
};

export const listingAPI = {
    // Get all listings
    getListings: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    queryParams.append(key, value.join(','));
                } else {
                    queryParams.append(key, value);
                }
            }
        });

        const url = queryParams.toString()
            ? `${API_BASE_URL}/listings?${queryParams.toString()}`
            : `${API_BASE_URL}/listings`;

        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch listings');
        }

        return response.json();
    },

    // Get listings with availability
    getListingsWithAvailability: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    queryParams.append(key, value.join(','));
                } else {
                    queryParams.append(key, value);
                }
            }
        });

        const url = `${API_BASE_URL}/listings/availability?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch listings availability');
        }

        return response.json();
    },

    // Get single listing
    getListing: async (listingId) => {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch listing');
        }

        return response.json();
    }
};

export const paymentAPI = {
    // Create payment order
    createPaymentOrder: async (amount) => {
        const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ amount })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create payment order');
        }

        return response.json();
    }
};

// Utility functions
export const bookingUtils = {
    getStatusColor: (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    getStatusIcon: (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✅';
            case 'cancelled': return '❌';
            default: return '❓';
        }
    },

    formatDate: (dateString, options = {}) => {
        const defaultOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };

        return new Date(dateString).toLocaleDateString('en-GB', {
            ...defaultOptions,
            ...options
        });
    },

    calculateNights: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    },

    calculateDaysUntilCheckin: (startDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkin = new Date(startDate);
        checkin.setHours(0, 0, 0, 0);
        return Math.ceil((checkin - today) / (1000 * 60 * 60 * 24));
    },

    isBookingCancellable: (booking) => {
        return booking.status === 'pending';
    },

    isBookingUpcoming: (startDate) => {
        const today = new Date();
        const checkin = new Date(startDate);
        return checkin > today;
    }
};
