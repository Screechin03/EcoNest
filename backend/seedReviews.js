import mongoose from 'mongoose';
import Review from './models/reviewModel.js';
import Listing from './models/listingModel.js';
import User from './models/userMode.js';
import connectDB from './config/db.js';

// Connect to database
connectDB();

const seedReviews = async () => {
    try {
        console.log('Starting to seed reviews...');

        // Get existing listings and users
        const listings = await Listing.find().limit(10);
        const users = await User.find().limit(5);

        if (listings.length === 0 || users.length === 0) {
            console.log('Need some listings and users first. Creating sample user...');

            // Create a sample user for reviews if none exist
            const sampleUser = new User({
                name: 'Sample Reviewer',
                email: 'reviewer@example.com',
                password: 'password123' // In real app, this would be hashed
            });

            users.push(await sampleUser.save());
        }

        // Sample review data
        const sampleReviews = [
            {
                rating: 5,
                comment: "Absolutely wonderful property! The host was incredibly welcoming and the location exceeded all expectations. The property was spotless, well-furnished, and had all the amenities we needed. The garden area was perfect for morning coffee. Highly recommend!"
            },
            {
                rating: 4,
                comment: "Great stay overall. The property is in a good location with easy access to public transport. The space was clean and comfortable. Only minor issue was that the WiFi was a bit slow, but everything else was perfect."
            },
            {
                rating: 5,
                comment: "Outstanding experience! The property photos don't do justice to how beautiful it actually is. The host provided excellent communication throughout our stay. The neighborhood is safe and has great restaurants nearby."
            },
            {
                rating: 4,
                comment: "Very good value for money. The property was exactly as described and the check-in process was smooth. The kitchen had everything we needed to prepare meals. Would definitely stay here again!"
            },
            {
                rating: 5,
                comment: "Perfect for our family vacation! The kids loved the garden space and the property had all the facilities we needed. The host went above and beyond to ensure we had a comfortable stay. Can't wait to come back!"
            },
            {
                rating: 3,
                comment: "Decent property for the price. The location is good and the space is adequate. However, some maintenance issues like a leaky faucet could be addressed. Overall, an okay experience."
            },
            {
                rating: 4,
                comment: "Really enjoyed our stay! The property is well-maintained and the host is very responsive. The parking facility was convenient. The only downside was that it can get a bit noisy during weekends."
            },
            {
                rating: 5,
                comment: "Exceptional property with amazing views! Everything was exactly as advertised. The cleanliness standards were top-notch and the amenities provided made our stay very comfortable. Highly recommended for couples!"
            },
            {
                rating: 4,
                comment: "Good property in a prime location. Easy access to shopping areas and restaurants. The property was clean and well-equipped. The host provided helpful local recommendations. Minor issue with the AC but was resolved quickly."
            },
            {
                rating: 5,
                comment: "Best stay we've had! The property is gorgeous, the host is fantastic, and the location is perfect. Every detail was thought through - from toiletries to kitchen supplies. This place feels like a home away from home."
            }
        ];

        let reviewsCreated = 0;

        // Create reviews for each listing
        for (let listing of listings) {
            // Create 2-4 reviews per listing
            const reviewCount = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < reviewCount && i < sampleReviews.length; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

                // Check if review already exists
                const existingReview = await Review.findOne({
                    listingId: listing._id,
                    userId: randomUser._id
                });

                if (!existingReview) {
                    const review = new Review({
                        listingId: listing._id,
                        userId: randomUser._id,
                        bookingId: new mongoose.Types.ObjectId(), // Dummy booking ID
                        rating: randomReview.rating,
                        comment: randomReview.comment,
                        isVerified: true,
                        helpfulCount: Math.floor(Math.random() * 10)
                    });

                    await review.save();
                    reviewsCreated++;
                }
            }
        }

        console.log(`✅ Successfully created ${reviewsCreated} reviews`);

        // Display stats
        const totalReviews = await Review.countDocuments();
        const avgRating = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        console.log(`📊 Total reviews in database: ${totalReviews}`);
        console.log(`⭐ Average rating: ${avgRating[0]?.avgRating?.toFixed(2) || 'N/A'}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        process.exit(1);
    }
};

seedReviews();
