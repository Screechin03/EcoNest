import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    location: { type: String, required: true }, // Full address for backward compatibility
    city: { type: String, required: true }, // City name
    state: { type: String }, // State/Province
    area: { type: String }, // Area/Neighborhood  
    landmark: { type: String }, // Nearby landmark
    pincode: { type: String }, // ZIP/Postal code
    images: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String], // Tags like "near airport", "near landmark"
    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    area_size: { type: String }, // Format like "5×7 m²" (renamed from area to avoid conflict)
    isPopular: { type: Boolean, default: false } // Flag for popular listings
}, {
    timestamps: true
});

export default mongoose.model('Listing', listingSchema);