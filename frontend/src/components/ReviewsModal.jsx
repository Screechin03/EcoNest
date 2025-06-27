import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaThumbsUp, FaUser, FaTimes, FaSort, FaLeaf, FaWater, FaRecycle, FaTrashAlt } from 'react-icons/fa';
import { API_URL } from '../config';

const ReviewsModal = ({ isOpen, onClose, listingId, propertyTitle }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('recent');
    const [pagination, setPagination] = useState(null);
    const modalRef = useRef(null);

    // Handle body scroll lock and modal interactions
    useEffect(() => {
        if (isOpen) {
            // Lock body scroll when modal opens
            document.body.style.overflow = 'hidden';

            // Focus the modal for accessibility
            if (modalRef.current) {
                modalRef.current.focus();
            }
        } else {
            // Restore body scroll when modal closes
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore scroll on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && listingId) {
            fetchReviews();
        }
    }, [isOpen, listingId, currentPage, sortBy]);

    // Handle backdrop click to close modal
    const handleBackdropClick = (event) => {
        // Only close if clicking the backdrop, not the modal content
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/reviews/listing/${listingId}?page=${currentPage}&limit=5&sort=${sortBy}`
            );

            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews);
                setStats(data.stats);
                setPagination(data.pagination);
            } else {
                console.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to mark reviews as helpful');
                return;
            }

            const response = await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Update the review's helpful count
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? { ...review, helpfulCount: data.helpfulCount }
                        : review
                ));
            }
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={`text-sm ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const renderRatingDistribution = () => {
        if (!stats?.ratingDistribution) return null;

        return (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg z-[999]">
                <h4 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h4>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                        const count = stats.ratingDistribution[rating] || 0;
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 w-8">
                                    {rating}★
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-8 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden focus:outline-none"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from bubbling up
            >
                {/* Modal Header */}
                <div className="bg-green-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 id="modal-title" className="text-2xl font-bold">Reviews</h2>
                        <p className="text-green-100">{propertyTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-green-200 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 rounded"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading reviews...</p>
                        </div>
                    ) : (
                        <>
                            {/* Review Stats */}
                            {stats && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-gray-800">
                                                {stats.averageRating?.toFixed(1) || '0.0'}
                                            </div>
                                            <div className="flex justify-center mb-1">
                                                {renderStars(Math.round(stats.averageRating || 0))}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {renderRatingDistribution()}
                                        </div>
                                    </div>

                                    {/* Sustainability Scores Summary */}
                                    {stats.sustainability && stats.sustainability.ratingsCount > 0 && (
                                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                                            <h4 className="flex items-center text-gray-800 font-semibold mb-3">
                                                <FaLeaf className="text-green-600 mr-2" />
                                                Sustainability Ratings
                                                <span className="ml-2 text-xs text-gray-500">
                                                    (Based on {stats.sustainability.ratingsCount} ratings)
                                                </span>
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Energy Efficiency */}
                                                {stats.sustainability.energyEfficiency > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaLeaf className="text-yellow-500 mr-1" />
                                                                Energy Efficiency
                                                            </span>
                                                            <span className="font-semibold text-yellow-600">
                                                                {stats.sustainability.energyEfficiency.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stats.sustainability.energyEfficiency / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Water Conservation */}
                                                {stats.sustainability.waterConservation > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaWater className="text-blue-500 mr-1" />
                                                                Water Conservation
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {stats.sustainability.waterConservation.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stats.sustainability.waterConservation / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Waste Management */}
                                                {stats.sustainability.wasteManagement > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaRecycle className="text-green-600 mr-1" />
                                                                Waste Management
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                {stats.sustainability.wasteManagement.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stats.sustainability.wasteManagement / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Carbon Footprint */}
                                                {stats.sustainability.carbonFootprint > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaTrashAlt className="text-red-500 mr-1" />
                                                                Carbon Footprint
                                                            </span>
                                                            <span className="font-semibold text-red-600">
                                                                {stats.sustainability.carbonFootprint.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-red-400 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stats.sustainability.carbonFootprint / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sort Options */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Customer Reviews
                                </h3>
                                <div className="flex items-center gap-2">
                                    <FaSort className="text-gray-400" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="rating-high">Highest Rating</option>
                                        <option value="rating-low">Lowest Rating</option>
                                        <option value="helpful">Most Helpful</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-4xl mb-4">💬</div>
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
                                    <p className="text-gray-500">Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">
                                                            {review.userId?.name || 'Anonymous User'}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            {review.isVerified && (
                                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                    Verified Stay
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>

                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                {review.comment}
                                            </p>

                                            {/* Sustainability Scores */}
                                            {review.sustainability && (
                                                Object.values(review.sustainability).some(val => val > 0) && (
                                                    <div className="mb-4 bg-green-50 p-3 rounded-lg">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                            <span className="text-green-600 mr-2">🌱</span>
                                                            Sustainability Ratings
                                                        </h5>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {review.sustainability.energyEfficiency > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">Energy:</span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <span key={i} className={`text-sm ${i < review.sustainability.energyEfficiency ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {review.sustainability.waterConservation > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">Water:</span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <span key={i} className={`text-sm ${i < review.sustainability.waterConservation ? 'text-blue-400' : 'text-gray-300'}`}>★</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {review.sustainability.wasteManagement > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">Waste:</span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <span key={i} className={`text-sm ${i < review.sustainability.wasteManagement ? 'text-green-400' : 'text-gray-300'}`}>★</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {review.sustainability.carbonFootprint > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">Carbon:</span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <span key={i} className={`text-sm ${i < review.sustainability.carbonFootprint ? 'text-red-400' : 'text-gray-300'}`}>★</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => handleHelpful(review._id)}
                                                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition text-sm"
                                                >
                                                    <FaThumbsUp className="text-xs" />
                                                    Helpful ({review.helpfulCount || 0})
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={!pagination.hasPrev}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm text-gray-600">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={!pagination.hasNext}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;
