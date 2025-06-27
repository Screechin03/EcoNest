import mongoose from 'mongoose';
import User from './models/userMode.js';
import Listing from './models/listingModel.js';
import connectDB from './config/db.js';

// Connect to database
connectDB();

const verifySeededData = async () => {
    try {
        console.log('Starting verification...');
        console.log('Verifying seeded data...');

        // Check users
        console.log('Checking users...');
        const users = await User.find({
            email: {
                $in: [
                    'indradeepmandal18@gmail.com',
                    'cse23054@iiitkalyani.ac.in',
                    'screechingensign03@gmail.com'
                ]
            }
        });
        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`- ${user.email} (${user.name}, role: ${user.role})`);
        });

        // Check popular listings
        console.log('Checking popular listings...');
        const listings = await Listing.find({ isPopular: true }).populate('owner', 'name email');
        console.log(`\nFound ${listings.length} popular listings:`);
        listings.forEach(listing => {
            console.log(`- ${listing.title} by ${listing.owner.name} ($${listing.price}/month)`);
        });

        // Group by owner
        console.log('Grouping by owner...');
        const listingsByOwner = {};
        listings.forEach(listing => {
            const ownerEmail = listing.owner.email;
            if (!listingsByOwner[ownerEmail]) {
                listingsByOwner[ownerEmail] = [];
            }
            listingsByOwner[ownerEmail].push(listing.title);
        });

        console.log('\nListings by owner:');
        Object.entries(listingsByOwner).forEach(([email, titles]) => {
            console.log(`- ${email}: ${titles.length} listings`);
            titles.forEach(title => console.log(`  * ${title}`));
        });

        console.log('\nVerification completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error verifying data:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

verifySeededData();
