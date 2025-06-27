import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    sustainability: {
        energyEfficiency: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        waterConservation: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        wasteManagement: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        carbonFootprint: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
reviewSchema.index({ listingId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
