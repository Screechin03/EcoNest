import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaUser } from 'react-icons/fa';
import { API_URL } from '../config';

const ReviewsSection = ({ listingId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('recent');
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (listingId) {
            fetchReviews();
        }
    }, [listingId, currentPage, sortBy]);

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
            // You would need authentication for this
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
                // Update the review in state
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? { ...review, helpfulCount: review.helpfulCount + 1 }
                        : review
                ));
            }
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const renderRatingDistribution = () => {
        if (!stats || !stats.ratingDistribution) return null;

        const total = stats.totalReviews;
        return (
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-4">{rating}</span>
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-8 text-gray-600">{count}</span>
                        </div>
                    );
                })}
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

    if (loading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border-b pb-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-md">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Reviews</h3>
                    {stats && stats.totalReviews > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                            <span className="text-xl font-semibold">{stats.averageRating.toFixed(1)}</span>
                            <span className="text-gray-600">({stats.totalReviews} reviews)</span>
                        </div>
                    )}
                </div>

                {/* Rating Distribution */}
                {stats && stats.totalReviews > 0 && (
                    <div className="lg:w-64">
                        <h4 className="font-semibold mb-3">Rating breakdown</h4>
                        {renderRatingDistribution()}
                    </div>
                )}
            </div>

            {/* Sort Controls */}
            {reviews.length > 0 && (
                <div className="flex items-center gap-4 mb-6 border-b pb-4">
                    <span className="font-medium">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="rating-high">Highest Rating</option>
                        <option value="rating-low">Lowest Rating</option>
                        <option value="helpful">Most Helpful</option>
                    </select>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <FaUser className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h4>
                    <p className="text-gray-500">Be the first to leave a review for this property!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <FaUser className="text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {review.userId?.name || 'Anonymous User'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(review.rating)}
                                    {review.isVerified && (
                                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3 leading-relaxed">
                                {review.comment}
                            </p>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handleHelpful(review._id)}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <FaThumbsUp className="w-3 h-3" />
                                    Helpful ({review.helpfulCount})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-1 text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
