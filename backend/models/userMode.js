import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Password is now required for all users
    role: { type: String, enum: ['seller', 'viewer'], default: 'viewer' },
    phone: { type: String },
    currentAddress: { type: String }
});

export default mongoose.model('User', userSchema);