import mongoose from 'mongoose';
import Listing from './models/listingModel.js';
import User from './models/userMode.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

// Connect to database
connectDB();

const seedPopularListingsIndia = async () => {
    try {
        console.log('Starting to seed popular listings for India...');

        // Create users if they don't exist
        const userEmails = [
            'indradeepmandal18@gmail.com',
            'cse23054@iiitkalyani.ac.in',
            'screechingensign03@gmail.com'
        ];

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
            }
            users.push(user);
        }

        // Clear existing popular listings
        await Listing.deleteMany({ isPopular: true });
        console.log('Cleared existing popular listings');

        // Popular listings data with Indian cities
        const popularListingsData = [
            // Mumbai listings
            {
                title: "Marine Drive Luxury Apartment",
                description: "Stunning 3-bedroom apartment with sea view facing Marine Drive. Premium location with modern amenities.",
                price: 8500,
                location: "Marine Drive, Nariman Point, Mumbai, Maharashtra 400021",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Nariman Point",
                landmark: "Marine Drive",
                pincode: "400021",
                beds: 3,
                baths: 2,
                area_size: "7×9 m²",
                images: ["/listing1.png"],
                tags: ["sea view", "luxury", "central location"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Bandra West Modern Studio",
                description: "Chic studio apartment in trendy Bandra West. Perfect for young professionals with great connectivity.",
                price: 4500,
                location: "Linking Road, Bandra West, Mumbai, Maharashtra 400050",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Bandra West",
                landmark: "Linking Road",
                pincode: "400050",
                beds: 1,
                baths: 1,
                area_size: "4×5 m²",
                images: ["/listing2.png"],
                tags: ["modern", "connectivity", "trendy"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Powai Lake View Villa",
                description: "Spacious 4-bedroom villa with lake view in Powai. Family-friendly with great schools nearby.",
                price: 9500,
                location: "Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Powai",
                landmark: "Powai Lake",
                pincode: "400076",
                beds: 4,
                baths: 3,
                area_size: "10×12 m²",
                images: ["/listing3.png"],
                tags: ["lake view", "family", "spacious"],
                isPopular: true,
                owner: users[2]._id
            },

            // Delhi listings
            {
                title: "Connaught Place Heritage Apartment",
                description: "Historic 2-bedroom apartment in the heart of Delhi. Walking distance to major attractions.",
                price: 6500,
                location: "Connaught Place, New Delhi, Delhi 110001",
                city: "Delhi",
                state: "Delhi",
                area: "Connaught Place",
                landmark: "India Gate",
                pincode: "110001",
                beds: 2,
                baths: 2,
                area_size: "6×8 m²",
                images: ["/listing4.png"],
                tags: ["heritage", "central", "historic"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Gurgaon Tech Hub Apartment",
                description: "Modern 3-bedroom apartment in Gurgaon's cyber city. Perfect for IT professionals.",
                price: 7000,
                location: "Cyber City, Sector 24, Gurgaon, Haryana 122002",
                city: "Delhi",
                state: "Haryana",
                area: "Gurgaon",
                landmark: "Cyber City",
                pincode: "122002",
                beds: 3,
                baths: 2,
                area_size: "8×10 m²",
                images: ["/listing5.png"],
                tags: ["tech hub", "modern", "IT professionals"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Vasant Kunj Green Oasis",
                description: "Peaceful 3-bedroom apartment surrounded by greenery in Vasant Kunj.",
                price: 7200,
                location: "Vasant Kunj, Sector A, New Delhi, Delhi 110070",
                city: "Delhi",
                state: "Delhi",
                area: "Vasant Kunj",
                landmark: "Select City Walk",
                pincode: "110070",
                beds: 3,
                baths: 2,
                area_size: "7×9 m²",
                images: ["/listing6.png"],
                tags: ["green", "peaceful", "family"],
                isPopular: true,
                owner: users[2]._id
            },

            // Bangalore listings
            {
                title: "Koramangala Tech Park Apartment",
                description: "Contemporary 2-bedroom apartment in Koramangala's startup hub. Great for young entrepreneurs.",
                price: 5500,
                location: "5th Block, Koramangala, Bangalore, Karnataka 560095",
                city: "Bangalore",
                state: "Karnataka",
                area: "Koramangala",
                landmark: "Forum Mall",
                pincode: "560095",
                beds: 2,
                baths: 2,
                area_size: "6×7 m²",
                images: ["/listing7.png"],
                tags: ["startup hub", "contemporary", "entrepreneurs"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Whitefield IT Corridor Home",
                description: "Spacious 3-bedroom home in Whitefield IT corridor. Perfect for tech professionals.",
                price: 6200,
                location: "ITPL Road, Whitefield, Bangalore, Karnataka 560066",
                city: "Bangalore",
                state: "Karnataka",
                area: "Whitefield",
                landmark: "ITPL",
                pincode: "560066",
                beds: 3,
                baths: 2,
                area_size: "8×9 m²",
                images: ["/listing8.png"],
                tags: ["IT corridor", "tech", "spacious"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Indiranagar Pub District Loft",
                description: "Trendy loft in Indiranagar's pub district. Perfect for nightlife enthusiasts.",
                price: 5200,
                location: "100 Feet Road, Indiranagar, Bangalore, Karnataka 560038",
                city: "Bangalore",
                state: "Karnataka",
                area: "Indiranagar",
                landmark: "100 Feet Road",
                pincode: "560038",
                beds: 2,
                baths: 1,
                area_size: "5×7 m²",
                images: ["/listing9.png"],
                tags: ["pub district", "trendy", "nightlife"],
                isPopular: true,
                owner: users[2]._id
            },

            // Chennai listings
            {
                title: "Marina Beach Front Apartment",
                description: "Beautiful 2-bedroom apartment facing Marina Beach. Wake up to ocean views every day.",
                price: 4800,
                location: "Marina Beach Road, Triplicane, Chennai, Tamil Nadu 600005",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "Triplicane",
                landmark: "Marina Beach",
                pincode: "600005",
                beds: 2,
                baths: 2,
                area_size: "6×8 m²",
                images: ["/listing10.png"],
                tags: ["beach front", "ocean view", "scenic"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "T. Nagar Shopping District Home",
                description: "Convenient 3-bedroom home in T. Nagar shopping district. Shopper's paradise location.",
                price: 4200,
                location: "Ranganathan Street, T. Nagar, Chennai, Tamil Nadu 600017",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "T. Nagar",
                landmark: "Ranganathan Street",
                pincode: "600017",
                beds: 3,
                baths: 2,
                area_size: "7×8 m²",
                images: ["/listing11.png"],
                tags: ["shopping district", "convenient", "central"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "OMR IT Hub Apartment",
                description: "Modern 2-bedroom apartment on Old Mahabalipuram Road. Perfect for IT professionals.",
                price: 5000,
                location: "Old Mahabalipuram Road, Sholinganallur, Chennai, Tamil Nadu 600119",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "Sholinganallur",
                landmark: "OMR",
                pincode: "600119",
                beds: 2,
                baths: 2,
                area_size: "6×7 m²",
                images: ["/listing12.png"],
                tags: ["IT hub", "modern", "OMR"],
                isPopular: true,
                owner: users[2]._id
            },

            // Hyderabad listings
            {
                title: "HITEC City Corporate Apartment",
                description: "Premium 3-bedroom apartment in HITEC City. Perfect for corporate executives.",
                price: 6500,
                location: "HITEC City, Madhapur, Hyderabad, Telangana 500081",
                city: "Hyderabad",
                state: "Telangana",
                area: "Madhapur",
                landmark: "HITEC City",
                pincode: "500081",
                beds: 3,
                baths: 2,
                area_size: "8×9 m²",
                images: ["/listing13.png"],
                tags: ["corporate", "premium", "HITEC City"],
                isPopular: true,
                owner: users[0]._id
            },
            {
                title: "Banjara Hills Elite Residence",
                description: "Luxurious 4-bedroom residence in prestigious Banjara Hills. Elite neighborhood.",
                price: 8800,
                location: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
                city: "Hyderabad",
                state: "Telangana",
                area: "Banjara Hills",
                landmark: "Jubilee Hills",
                pincode: "500034",
                beds: 4,
                baths: 3,
                area_size: "10×11 m²",
                images: ["/listing14.png"],
                tags: ["luxurious", "elite", "prestigious"],
                isPopular: true,
                owner: users[1]._id
            },

            // Pune listings
            {
                title: "Koregaon Park Trendy Apartment",
                description: "Stylish 2-bedroom apartment in trendy Koregaon Park. Great cafe culture nearby.",
                price: 5100,
                location: "Koregaon Park, Pune, Maharashtra 411001",
                city: "Pune",
                state: "Maharashtra",
                area: "Koregaon Park",
                landmark: "Osho Ashram",
                pincode: "411001",
                beds: 2,
                baths: 2,
                area_size: "6×7 m²",
                images: ["/listing15.png"],
                tags: ["trendy", "cafe culture", "stylish"],
                isPopular: true,
                owner: users[2]._id
            },
            {
                title: "Hinjewadi IT Park Home",
                description: "Comfortable 3-bedroom home near Hinjewadi IT Park. Perfect for IT professionals.",
                price: 4700,
                location: "Phase 1, Hinjewadi, Pune, Maharashtra 411057",
                city: "Pune",
                state: "Maharashtra",
                area: "Hinjewadi",
                landmark: "Rajiv Gandhi IT Park",
                pincode: "411057",
                beds: 3,
                baths: 2,
                area_size: "7×8 m²",
                images: ["/listing16.png"],
                tags: ["IT park", "comfortable", "professionals"],
                isPopular: true,
                owner: users[0]._id
            },

            // Kolkata listings
            {
                title: "Park Street Cultural Hub",
                description: "Charming 2-bedroom apartment on famous Park Street. Heart of Kolkata's cultural scene.",
                price: 3800,
                location: "Park Street, Kolkata, West Bengal 700016",
                city: "Kolkata",
                state: "West Bengal",
                area: "Park Street",
                landmark: "Park Street",
                pincode: "700016",
                beds: 2,
                baths: 2,
                area_size: "6×7 m²",
                images: ["/listing17.png"],
                tags: ["cultural hub", "charming", "heritage"],
                isPopular: true,
                owner: users[1]._id
            },
            {
                title: "Salt Lake Modern Complex",
                description: "Contemporary 3-bedroom apartment in planned Salt Lake City. Well-organized neighborhood.",
                price: 4300,
                location: "Sector V, Salt Lake City, Kolkata, West Bengal 700091",
                city: "Kolkata",
                state: "West Bengal",
                area: "Salt Lake",
                landmark: "City Centre",
                pincode: "700091",
                beds: 3,
                baths: 2,
                area_size: "7×8 m²",
                images: ["/listing18.png"],
                tags: ["contemporary", "planned city", "organized"],
                isPopular: true,
                owner: users[2]._id
            }
        ];

        // Create listings
        const createdListings = await Listing.insertMany(popularListingsData);
        console.log(`Created ${createdListings.length} popular listings in Indian cities`);

        console.log('Popular listings seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding popular listings:', error);
        process.exit(1);
    }
};

seedPopularListingsIndia();
