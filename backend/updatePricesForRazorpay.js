import mongoose from 'mongoose';
import Listing from './models/listingModel.js';
import connectDB from './config/db.js';

// Connect to database
await connectDB();

const updatePricesForRazorpay = async () => {
    try {
        console.log('Starting to update all prices to be under ₹10,000 for Razorpay test mode...');
        console.log('Database connected successfully');

        // Get all listings
        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to update`);

        const updates = [];

        for (const listing of listings) {
            let newPrice = listing.price;

            // If price is above 10000, reduce it proportionally
            if (listing.price > 10000) {
                // Reduce prices to be between 2000-9999 based on original price ranges
                if (listing.price >= 50000) {
                    newPrice = Math.floor(7000 + (listing.price % 2000)); // 7000-8999
                } else if (listing.price >= 40000) {
                    newPrice = Math.floor(6000 + (listing.price % 1000)); // 6000-6999
                } else if (listing.price >= 30000) {
                    newPrice = Math.floor(5000 + (listing.price % 1000)); // 5000-5999
                } else if (listing.price >= 25000) {
                    newPrice = Math.floor(4000 + (listing.price % 1000)); // 4000-4999
                } else if (listing.price >= 20000) {
                    newPrice = Math.floor(3000 + (listing.price % 1000)); // 3000-3999
                } else if (listing.price >= 15000) {
                    newPrice = Math.floor(2500 + (listing.price % 500)); // 2500-2999
                } else {
                    newPrice = Math.floor(2000 + (listing.price % 1000)); // 2000-2999
                }

                // Ensure price is under 10000
                if (newPrice >= 10000) {
                    newPrice = 9999;
                }
            }

            updates.push({
                updateOne: {
                    filter: { _id: listing._id },
                    update: { $set: { price: newPrice } }
                }
            });

            console.log(`${listing.title}: ₹${listing.price.toLocaleString()} → ₹${newPrice.toLocaleString()}`);
        }

        // Bulk update all listings
        if (updates.length > 0) {
            const result = await Listing.bulkWrite(updates);
            console.log(`Updated ${result.modifiedCount} listings successfully`);
        }

        // Verify results
        const updatedListings = await Listing.find({ price: { $gte: 10000 } });
        if (updatedListings.length > 0) {
            console.log(`Warning: ${updatedListings.length} listings still have prices ≥ ₹10,000`);
            updatedListings.forEach(listing => {
                console.log(`- ${listing.title}: ₹${listing.price.toLocaleString()}`);
            });
        } else {
            console.log('✅ All listings now have prices under ₹10,000');
        }

        // Show some statistics
        const priceStats = await Listing.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' },
                    totalListings: { $sum: 1 }
                }
            }
        ]);

        if (priceStats.length > 0) {
            const stats = priceStats[0];
            console.log('\n📊 Updated Price Statistics:');
            console.log(`Total Listings: ${stats.totalListings}`);
            console.log(`Price Range: ₹${stats.minPrice.toLocaleString()} - ₹${stats.maxPrice.toLocaleString()}`);
            console.log(`Average Price: ₹${Math.round(stats.avgPrice).toLocaleString()}`);
        }

        console.log('\n✅ Price update completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
};

// Run the update
(async () => {
    try {
        await updatePricesForRazorpay();
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
})();
