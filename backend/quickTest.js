import mongoose from 'mongoose';
import Listing from './models/listingModel.js';
import connectDB from './config/db.js';

connectDB();

const quickTest = async () => {
    try {
        console.log('Testing database connection...');

        // Test basic listing count
        const totalListings = await Listing.countDocuments();
        console.log(`Total listings: ${totalListings}`);

        // Test popular listings
        const popularListings = await Listing.countDocuments({ isPopular: true });
        console.log(`Popular listings: ${popularListings}`);

        // Test if listings have city field
        const listingsWithCity = await Listing.countDocuments({ city: { $exists: true } });
        console.log(`Listings with city field: ${listingsWithCity}`);

        // Sample listing data
        const sampleListing = await Listing.findOne();
        if (sampleListing) {
            console.log('Sample listing fields:', Object.keys(sampleListing.toObject()));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

quickTest();
