import mongoose from 'mongoose';
import Listing from './models/listingModel.js';
import User from './models/userMode.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

// Connect to database
connectDB();

const seedPopularListings = async () => {
    try {
        console.log('Starting to seed popular listings...');

        // Create users if they don't exist
        const userEmails = [
            'indradeepmandal18@gmail.com',
            'cse23054@iiitkalyani.ac.in',
            'screechingensign03@gmail.com'
        ];

        console.log('Creating users...');
        const users = [];
        for (const email of userEmails) {
            let user = await User.findOne({ email });
            if (!user) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                user = new User({
                    name: email.split('@')[0],
                    email,
                    password: hashedPassword,
                    role: 'seller'
                });
                await user.save();
                console.log(`Created user: ${email}`);
            } else {
                console.log(`User already exists: ${email}`);
            }
            users.push(user);
        }

        // Clear existing popular listings
        const deletedCount = await Listing.deleteMany({ isPopular: true });
        console.log(`Cleared ${deletedCount.deletedCount} existing popular listings`);

        // Popular listings data matching the frontend structure
        const popularListingsData = [
            // Page 1 listings
            {
                title: "Silverwood Manor",
                description: "A luxurious 2-bedroom apartment with modern amenities and stunning city views. Perfect for couples or small families looking for comfort and style.",
                price: 3095,
                location: "6391 Elgin St. Celina, Delaware 10299",
                beds: 2,
                baths: 2,
                area: "5×7 m²",
                images: ["/listing1.png"],
                tags: ["luxury", "city view", "modern"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Palmstone Residences",
                description: "Spacious 4-bedroom home with beautiful garden and family-friendly amenities. Located in a quiet residential area.",
                price: 2500,
                location: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
                beds: 4,
                baths: 2,
                area: "6×7.5 m²",
                images: ["/listing2.png"],
                tags: ["family-friendly", "garden", "quiet"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Cedar Grove Estate",
                description: "Elegant 3-bedroom estate with premium finishes and spacious living areas. Ideal for those seeking luxury and comfort.",
                price: 3550,
                location: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
                beds: 3,
                baths: 3,
                area: "8×10 m²",
                images: ["/listing3.png"],
                tags: ["luxury", "spacious", "premium"],
                isPopular: true,
                owner: users[2]._id
            },
            {
                title: "Hillside Haven",
                description: "Affordable 4-bedroom home with mountain views and cozy interiors. Perfect for families on a budget.",
                price: 1400,
                location: "3517 W. Gray St. Utica, Pennsylvania 57867",
                beds: 4,
                baths: 2,
                area: "6×8 m²",
                images: ["/listing4.png"],
                tags: ["affordable", "mountain view", "family"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "The Oakridge Villa",
                description: "Charming 2-bedroom villa with traditional design and modern conveniences. Located in a peaceful neighborhood.",
                price: 2500,
                location: "243 Curlew Road, Palm Harbor, TX",
                beds: 2,
                baths: 1,
                area: "5×7.5 m²",
                images: ["/listing5.png"],
                tags: ["charming", "traditional", "peaceful"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Sunset Terrace",
                description: "Modern 3-bedroom apartment with panoramic sunset views and rooftop access. Perfect for entertaining guests.",
                price: 2800,
                location: "789 Sunset Blvd. Los Angeles, California 90210",
                beds: 3,
                baths: 2,
                area: "6×8 m²",
                images: ["/listing6.png"],
                tags: ["modern", "sunset view", "rooftop"],
                isPopular: true,
                owner: users[2]._id
            },

            // Page 2 listings
            {
                title: "Willow Creek Lodge",
                description: "Rustic 4-bedroom lodge surrounded by nature. Perfect for those seeking tranquility and outdoor activities.",
                price: 1900,
                location: "456 Creek Way, Portland, Oregon 97201",
                beds: 4,
                baths: 3,
                area: "7×9 m²",
                images: ["/listing7.png"],
                tags: ["rustic", "nature", "tranquil"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Downtown Loft",
                description: "Stylish downtown loft with industrial design and city conveniences. Walking distance to restaurants and shops.",
                price: 2200,
                location: "321 Main St. Chicago, Illinois 60601",
                beds: 1,
                baths: 1,
                area: "4×6 m²",
                images: ["/listing8.png"],
                tags: ["loft", "downtown", "walkable"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Seaside Cottage",
                description: "Cozy beachfront cottage with ocean views and private beach access. Perfect for a relaxing getaway.",
                price: 3200,
                location: "123 Ocean Dr. Miami Beach, Florida 33139",
                beds: 2,
                baths: 2,
                area: "5×7 m²",
                images: ["/listing9.png"],
                tags: ["beachfront", "ocean view", "cottage"],
                isPopular: true,
                owner: users[2]._id
            },
            {
                title: "Mountain Retreat",
                description: "Secluded mountain cabin with fireplace and hiking trails nearby. Ideal for nature lovers and peace seekers.",
                price: 1800,
                location: "987 Mountain Rd. Denver, Colorado 80202",
                beds: 3,
                baths: 2,
                area: "6×7 m²",
                images: ["/listing10.png"],
                tags: ["mountain", "secluded", "fireplace"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Riverbend Cottage",
                description: "Peaceful riverside cottage with fishing access and nature trails. Perfect for outdoor enthusiasts.",
                price: 2600,
                location: "654 Riverbend Dr. Seattle, Washington 98101",
                beds: 2,
                baths: 2,
                area: "5×7 m²",
                images: ["/listing11.png"],
                tags: ["riverside", "fishing", "nature"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Oak Lane Residence",
                description: "Traditional family home with large backyard and classic architecture. Great for families with children.",
                price: 1800,
                location: "987 Oak Ln. Boston, Massachusetts 02101",
                beds: 3,
                baths: 1,
                area: "5×6 m²",
                images: ["/listing12.png"],
                tags: ["traditional", "family", "backyard"],
                isPopular: true,
                owner: users[2]._id
            },

            // Page 3 listings
            {
                title: "Birchwood Estate",
                description: "Grand estate with multiple bedrooms and luxury amenities. Perfect for large groups or special events.",
                price: 2950,
                location: "111 Birchwood Dr. Dallas, Texas 75201",
                beds: 4,
                baths: 3,
                area: "7×8 m²",
                images: ["/listing13.png"],
                tags: ["estate", "luxury", "large groups"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Magnolia Place",
                description: "Southern charm meets modern comfort in this beautiful 2-bedroom home with wraparound porch.",
                price: 2300,
                location: "222 Magnolia Ave. Atlanta, Georgia 30301",
                beds: 2,
                baths: 2,
                area: "5×7 m²",
                images: ["/listing14.png"],
                tags: ["southern", "charm", "porch"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Aspen Ridge",
                description: "Ski-in/ski-out mountain property with stunning alpine views and luxury mountain amenities.",
                price: 3100,
                location: "333 Aspen Rd. Aspen, Colorado 81611",
                beds: 3,
                baths: 2,
                area: "6×8 m²",
                images: ["/listing15.png"],
                tags: ["ski", "alpine", "luxury mountain"],
                isPopular: true,
                owner: users[2]._id
            },
            {
                title: "Cypress Court",
                description: "Affordable family home near theme parks and attractions. Perfect for vacation rentals and family trips.",
                price: 1600,
                location: "444 Cypress Ct. Orlando, Florida 32801",
                beds: 2,
                baths: 1,
                area: "5×6 m²",
                images: ["/listing16.png"],
                tags: ["affordable", "theme parks", "family vacation"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Elmwood House",
                description: "Spacious family home with pool and entertainment areas. Great for hosting and family gatherings.",
                price: 2700,
                location: "555 Elmwood St. San Diego, California 92101",
                beds: 4,
                baths: 2,
                area: "6×8 m²",
                images: ["/listing17.png"],
                tags: ["pool", "entertainment", "spacious"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Rosehill Villa",
                description: "Music city charm in this lovely 3-bedroom villa. Walking distance to music venues and nightlife.",
                price: 1700,
                location: "666 Rosehill Rd. Nashville, Tennessee 37201",
                beds: 3,
                baths: 1,
                area: "5×7 m²",
                images: ["/listing18.png"],
                tags: ["music city", "nightlife", "walkable"],
                isPopular: true,
                owner: users[2]._id
            }
        ];

        // Create listings
        const createdListings = await Listing.insertMany(popularListingsData);
        console.log(`Created ${createdListings.length} popular listings`);

        console.log('Popular listings seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding popular listings:', error);
        process.exit(1);
    }
};

seedPopularListings();
