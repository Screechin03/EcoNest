import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all reviews for a listing
router.get('/listing/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        let sortOption = { createdAt: -1 }; // Default: most recent first
        if (sort === 'rating-high') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'rating-low') sortOption = { rating: 1, createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpfulCount: -1, createdAt: -1 };

        const reviews = await Review.find({ listingId })
            .populate('userId', 'name')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments({ listingId });

        // Calculate rating stats
        const ratingStats = await Review.aggregate([
            { $match: { listingId: new mongoose.Types.ObjectId(listingId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingBreakdown: {
                        $push: '$rating'
                    },
                    // Calculate average sustainability scores
                    avgEnergyEfficiency: {
                        $avg: {
                            $cond: [
                                { $gt: ["$sustainability.energyEfficiency", 0] },
                                "$sustainability.energyEfficiency",
                                null
                            ]
                        }
                    },
                    avgWaterConservation: {
                        $avg: {
                            $cond: [
                                { $gt: ["$sustainability.waterConservation", 0] },
                                "$sustainability.waterConservation",
                                null
                            ]
                        }
                    },
                    avgWasteManagement: {
                        $avg: {
                            $cond: [
                                { $gt: ["$sustainability.wasteManagement", 0] },
                                "$sustainability.wasteManagement",
                                null
                            ]
                        }
                    },
                    avgCarbonFootprint: {
                        $avg: {
                            $cond: [
                                { $gt: ["$sustainability.carbonFootprint", 0] },
                                "$sustainability.carbonFootprint",
                                null
                            ]
                        }
                    },
                    // Count reviews with sustainability ratings
                    sustainabilityRatingsCount: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $gt: ["$sustainability.energyEfficiency", 0] },
                                        { $gt: ["$sustainability.waterConservation", 0] },
                                        { $gt: ["$sustainability.wasteManagement", 0] },
                                        { $gt: ["$sustainability.carbonFootprint", 0] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Calculate rating distribution
        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingStats.length > 0) {
            ratingStats[0].ratingBreakdown.forEach(rating => {
                ratingDistribution[rating]++;
            });
        }

        res.json({
            reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalReviews: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            stats: ratingStats.length > 0 ? {
                averageRating: ratingStats[0].averageRating,
                totalReviews: ratingStats[0].totalReviews,
                ratingDistribution,
                sustainability: {
                    energyEfficiency: ratingStats[0].avgEnergyEfficiency || 0,
                    waterConservation: ratingStats[0].avgWaterConservation || 0,
                    wasteManagement: ratingStats[0].avgWasteManagement || 0,
                    carbonFootprint: ratingStats[0].avgCarbonFootprint || 0,
                    ratingsCount: ratingStats[0].sustainabilityRatingsCount || 0
                }
            } : {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution,
                sustainability: {
                    energyEfficiency: 0,
                    waterConservation: 0,
                    wasteManagement: 0,
                    carbonFootprint: 0,
                    ratingsCount: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add a review (authenticated users only, must have completed booking)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            listingId,
            bookingId,
            rating,
            comment,
            sustainability
        } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!listingId || !bookingId || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if booking exists and belongs to user
        const booking = await Booking.findOne({
            _id: bookingId,
            user: userId,
            status: 'confirmed' // Only confirmed bookings can review
        });

        if (!booking) {
            return res.status(403).json({ message: 'You can only review properties you have booked' });
        }

        // Check if user already reviewed this listing for this booking
        const existingReview = await Review.findOne({
            listingId,
            userId,
            bookingId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this property' });
        }

        // Create new review
        const review = new Review({
            listingId,
            userId,
            bookingId,
            rating: parseInt(rating),
            comment: comment.trim(),
            sustainability: sustainability || {
                energyEfficiency: 0,
                waterConservation: 0,
                wasteManagement: 0,
                carbonFootprint: 0
            },
            isVerified: true // Mark as verified since we checked the booking
        });

        await review.save();

        // Populate user data for response
        await review.populate('userId', 'name');

        res.status(201).json({
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update review helpfulness
router.post('/:reviewId/helpful', authMiddleware, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { helpfulCount: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Thank you for your feedback', helpfulCount: review.helpfulCount });
    } catch (error) {
        console.error('Error updating review helpfulness:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's reviews
router.get('/user/my-reviews', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ userId })
            .populate('listingId', 'title images location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments({ userId });

        res.json({
            reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalReviews: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
