import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false }, // Made optional for Google auth users
    role: { type: String, enum: ['seller', 'viewer'], default: 'viewer' },
    phone: { type: String },
    currentAddress: { type: String },
    googleId: { type: String, sparse: true }, // For Google authentication
    profilePicture: { type: String } // Profile picture URL from Google
});

export default mongoose.model('User', userSchema);