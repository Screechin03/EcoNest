import mongoose from 'mongoose';
import Listing from './models/listingModel.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for cleanup');

        // Delete ALL existing listings to start fresh
        const deleteResult = await Listing.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing listings`);

        // Re-run the seed script with clean Indian data
        console.log('Creating fresh Indian listings...');

        const seedData = [
            {
                title: "Luxury Villa in Bandra",
                location: "Bandra West, Mumbai, Maharashtra, India",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Bandra West",
                landmark: "Near Bandstand Promenade",
                pincode: "400050",
                price: 25000,
                bedrooms: 3,
                bathrooms: 2,
                area_size: "1200 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Parking", "Security"],
                images: ["/listing1.png"],
                host: "67661c6e463dd8ba99e6b998",
                description: "Beautiful 3BHK villa in prime Bandra location with modern amenities and sea view."
            },
            {
                title: "Modern Flat in Powai",
                location: "Powai, Mumbai, Maharashtra, India",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Powai",
                landmark: "Near Powai Lake",
                pincode: "400076",
                price: 20000,
                bedrooms: 2,
                bathrooms: 2,
                area_size: "1000 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Gym"],
                images: ["/listing2.png"],
                host: "676620afed4bb4b1e2deda6d",
                description: "Modern 2BHK apartment with lake view and tech park proximity."
            },
            {
                title: "Sea Facing Apartment in Juhu",
                location: "Juhu, Mumbai, Maharashtra, India",
                city: "Mumbai",
                state: "Maharashtra",
                area: "Juhu",
                landmark: "Near Juhu Beach",
                pincode: "400049",
                price: 30000,
                bedrooms: 3,
                bathrooms: 3,
                area_size: "1500 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Beach Access", "Parking"],
                images: ["/listing3.png"],
                host: "676622046b2b48b6f1b42a37",
                description: "Luxurious 3BHK with stunning sea views and beach access."
            },
            {
                title: "Cozy Apartment in Connaught Place",
                location: "Connaught Place, New Delhi, Delhi, India",
                city: "Delhi",
                state: "Delhi",
                area: "Connaught Place",
                landmark: "Near Central Park",
                pincode: "110001",
                price: 18000,
                bedrooms: 2,
                bathrooms: 1,
                area_size: "800 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Metro Access"],
                images: ["/listing4.png"],
                host: "67661c6e463dd8ba99e6b998",
                description: "Modern 2BHK apartment in the heart of Delhi with excellent connectivity."
            },
            {
                title: "Executive Suite in Gurgaon",
                location: "Sector 32, Gurgaon, Haryana, India",
                city: "Delhi",
                state: "Delhi",
                area: "Gurgaon",
                landmark: "Near Cyber Hub",
                pincode: "122001",
                price: 22000,
                bedrooms: 1,
                bathrooms: 1,
                area_size: "600 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Corporate Access"],
                images: ["/listing5.png"],
                host: "676620afed4bb4b1e2deda6d",
                description: "Perfect for business travelers, located in corporate hub."
            },
            {
                title: "Heritage Home in Lajpat Nagar",
                location: "Lajpat Nagar, New Delhi, Delhi, India",
                city: "Delhi",
                state: "Delhi",
                area: "Lajpat Nagar",
                landmark: "Near Central Market",
                pincode: "110024",
                price: 15000,
                bedrooms: 2,
                bathrooms: 2,
                area_size: "900 sq ft",
                amenities: ["WiFi", "Kitchen", "Traditional Architecture"],
                images: ["/listing6.png"],
                host: "676622046b2b48b6f1b42a37",
                description: "Traditional Delhi home with modern amenities and cultural charm."
            },
            {
                title: "Tech Hub Apartment in Koramangala",
                location: "Koramangala, Bangalore, Karnataka, India",
                city: "Bangalore",
                state: "Karnataka",
                area: "Koramangala",
                landmark: "Near Sony World Signal",
                pincode: "560034",
                price: 22000,
                bedrooms: 2,
                bathrooms: 2,
                area_size: "1000 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Gym", "Swimming Pool"],
                images: ["/listing7.png"],
                host: "67661c6e463dd8ba99e6b998",
                description: "Perfect for tech professionals, located in Bangalore's startup hub."
            },
            {
                title: "Garden Villa in Whitefield",
                location: "Whitefield, Bangalore, Karnataka, India",
                city: "Bangalore",
                state: "Karnataka",
                area: "Whitefield",
                landmark: "Near ITPL",
                pincode: "560066",
                price: 28000,
                bedrooms: 3,
                bathrooms: 3,
                area_size: "1400 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Garden", "Parking"],
                images: ["/listing8.png"],
                host: "676620afed4bb4b1e2deda6d",
                description: "Spacious villa with garden, ideal for IT professionals."
            },
            {
                title: "Central Bangalore Flat",
                location: "MG Road, Bangalore, Karnataka, India",
                city: "Bangalore",
                state: "Karnataka",
                area: "MG Road",
                landmark: "Near Brigade Road",
                pincode: "560001",
                price: 19000,
                bedrooms: 1,
                bathrooms: 1,
                area_size: "750 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Metro Access"],
                images: ["/listing9.png"],
                host: "676622046b2b48b6f1b42a37",
                description: "Centrally located studio apartment with city connectivity."
            },
            {
                title: "Beach View Flat in Marina",
                location: "Marina Beach, Chennai, Tamil Nadu, India",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "Marina",
                landmark: "Near Marina Beach",
                pincode: "600013",
                price: 20000,
                bedrooms: 2,
                bathrooms: 2,
                area_size: "900 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Beach Access"],
                images: ["/listing10.png"],
                host: "67661c6e463dd8ba99e6b998",
                description: "Stunning 2BHK with direct beach views and modern amenities."
            },
            {
                title: "IT Corridor Apartment in OMR",
                location: "OMR, Chennai, Tamil Nadu, India",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "OMR",
                landmark: "Near IT Parks",
                pincode: "600119",
                price: 18000,
                bedrooms: 2,
                bathrooms: 2,
                area_size: "950 sq ft",
                amenities: ["WiFi", "AC", "Kitchen", "Shuttle Service"],
                images: ["/listing11.png"],
                host: "676620afed4bb4b1e2deda6d",
                description: "Modern apartment on IT corridor with tech company access."
            },
            {
                title: "Traditional Home in Mylapore",
                location: "Mylapore, Chennai, Tamil Nadu, India",
                city: "Chennai",
                state: "Tamil Nadu",
                area: "Mylapore",
                landmark: "Near Kapaleeshwarar Temple",
                pincode: "600004",
                price: 16000,
                bedrooms: 2,
                bathrooms: 1,
                area_size: "850 sq ft",
                amenities: ["WiFi", "Kitchen", "Traditional Architecture", "Temple Proximity"],
                images: ["/listing12.png"],
                host: "676622046b2b48b6f1b42a37",
                description: "Traditional Chennai home with cultural heritage and modern comfort."
            }
        ];

        await Listing.insertMany(seedData);
        console.log(`Created ${seedData.length} new listings with proper city data`);

        // Verify the data
        const cities = await Listing.distinct('city');
        console.log(`Cities in database: ${cities.join(', ')}`);

        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupDatabase();
