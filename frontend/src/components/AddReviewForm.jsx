import React, { useState } from 'react';
import { FaStar, FaPaperPlane, FaLeaf, FaWater, FaRecycle, FaTrashAlt } from 'react-icons/fa';
import { API_URL } from '../config';

const AddReviewForm = ({ listingId, onReviewAdded, userBookings = [] }) => {
    const [formData, setFormData] = useState({
        bookingId: '',
        rating: 0,
        comment: '',
        sustainability: {
            energyEfficiency: 0,
            waterConservation: 0,
            wasteManagement: 0,
            carbonFootprint: 0
        }
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [hoveredSustainability, setHoveredSustainability] = useState({
        energyEfficiency: 0,
        waterConservation: 0,
        wasteManagement: 0,
        carbonFootprint: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter bookings for this specific listing that are confirmed
    const eligibleBookings = userBookings.filter(booking =>
        booking.listing?._id === listingId &&
        booking.status === 'confirmed' &&
        !booking.hasReviewed // Assuming we add this flag when user reviews
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bookingId || !formData.rating || !formData.comment.trim()) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Please login to leave a review' });
                return;
            }

            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    listingId,
                    bookingId: formData.bookingId,
                    rating: formData.rating,
                    comment: formData.comment.trim(),
                    sustainability: formData.sustainability
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Review submitted successfully!' });
                setFormData({ bookingId: '', rating: 0, comment: '' });
                if (onReviewAdded) {
                    onReviewAdded(data.review);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to submit review' });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSustainabilityRatingClick = (category, rating) => {
        setFormData(prev => ({
            ...prev,
            sustainability: {
                ...prev.sustainability,
                [category]: rating
            }
        }));
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= (hoveredRating || formData.rating);

            return (
                <button
                    key={index}
                    type="button"
                    className={`text-2xl transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                    onClick={() => handleRatingClick(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                >
                    <FaStar />
                </button>
            );
        });
    };

    const renderSustainabilityStars = (category) => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= (hoveredSustainability[category] || formData.sustainability[category]);

            return (
                <button
                    key={index}
                    type="button"
                    className={`text-lg transition-colors ${isActive ? 'text-green-500' : 'text-gray-300'
                        } hover:text-green-500`}
                    onClick={() => handleSustainabilityRatingClick(category, starValue)}
                    onMouseEnter={() => setHoveredSustainability(prev => ({ ...prev, [category]: starValue }))}
                    onMouseLeave={() => setHoveredSustainability(prev => ({ ...prev, [category]: 0 }))}
                >
                    <FaStar />
                </button>
            );
        });
    };

    // Don't show the form if user has no eligible bookings
    if (eligibleBookings.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">
                    You need to complete a booking for this property before you can leave a review.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-md border">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                Leave a Review
            </h3>

            {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Booking Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select your booking
                    </label>
                    <select
                        value={formData.bookingId}
                        onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select a booking...</option>
                        {eligibleBookings.map(booking => (
                            <option key={booking._id} value={booking._id}>
                                Booking from {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating {formData.rating > 0 && `(${formData.rating} out of 5)`}
                    </label>
                    <div className="flex gap-1">
                        {renderStars()}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your review
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this property..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        required
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        {formData.comment.length}/1000 characters
                    </div>
                </div>

                {/* Sustainability Ratings */}
                <div>
                    <h4 className="block text-md font-medium text-gray-700 mb-2 flex items-center">
                        <FaLeaf className="text-green-500 mr-2" />
                        Sustainability Ratings (Optional)
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Help future guests by rating the property's eco-friendly features
                    </p>

                    <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                        {/* Energy Efficiency */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FaLeaf className="text-yellow-500 mr-2" />
                                Energy Efficiency {formData.sustainability.energyEfficiency > 0 && `(${formData.sustainability.energyEfficiency})`}
                            </label>
                            <div className="flex gap-1">
                                {renderSustainabilityStars('energyEfficiency')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Solar panels, energy-efficient appliances, LED lighting
                            </p>
                        </div>

                        {/* Water Conservation */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FaWater className="text-blue-500 mr-2" />
                                Water Conservation {formData.sustainability.waterConservation > 0 && `(${formData.sustainability.waterConservation})`}
                            </label>
                            <div className="flex gap-1">
                                {renderSustainabilityStars('waterConservation')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Low-flow fixtures, rainwater harvesting, efficient irrigation
                            </p>
                        </div>

                        {/* Waste Management */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FaRecycle className="text-green-600 mr-2" />
                                Waste Management {formData.sustainability.wasteManagement > 0 && `(${formData.sustainability.wasteManagement})`}
                            </label>
                            <div className="flex gap-1">
                                {renderSustainabilityStars('wasteManagement')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Recycling facilities, composting, waste reduction efforts
                            </p>
                        </div>

                        {/* Carbon Footprint */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FaTrashAlt className="text-red-500 mr-2" />
                                Carbon Footprint {formData.sustainability.carbonFootprint > 0 && `(${formData.sustainability.carbonFootprint})`}
                            </label>
                            <div className="flex gap-1">
                                {renderSustainabilityStars('carbonFootprint')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Overall environmental impact and emissions reduction
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.bookingId || !formData.rating || !formData.comment.trim()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <FaPaperPlane />
                            Submit Review
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddReviewForm;
