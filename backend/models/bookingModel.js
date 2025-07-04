import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    price: { type: Number },
    paymentOrderId: { type: String },
    paymentId: { type: String }
}, {
    timestamps: true // This adds createdAt and updatedAt fields
});

export default mongoose.model('Booking', bookingSchema);