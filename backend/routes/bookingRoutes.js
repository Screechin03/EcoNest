import express from 'express';
import bookingSchema from '../models/bookingModel.js';
import listingSchema from '../models/listingModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import dayjs from 'dayjs';
const router = express.Router();
import { sendEmail } from '../utils/email.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Create a new booking (only for viewers, not owners)
router.post(
    '/',
    authMiddleware,
    [
        body('listing').notEmpty(),
        body('startDate').isISO8601(),
        body('endDate').isISO8601(),
        body('paymentOrderId').notEmpty(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            if (req.user.role !== 'viewer') {
                return res.status(403).json({ error: 'Only viewers can make bookings.' });
            }
            const listing = await listingSchema.findById(req.body.listing).populate('owner', 'name email');
            if (!listing) return res.status(404).json({ error: 'Listing not found' });

            if (listing.owner._id.equals(req.user.id)) {
                return res.status(403).json({ error: 'You cannot book your own listing.' });
            }

            // Calculate number of nights
            const start = dayjs(req.body.startDate);
            const end = dayjs(req.body.endDate);
            const nights = end.diff(start, 'day');
            if (nights <= 0) return res.status(400).json({ error: 'End date must be after start date.' });

            // Calculate total price
            const totalPrice = listing.price * nights;

            // Check for overlapping bookings (only confirmed ones)
            const overlapping = await bookingSchema.findOne({
                listing: listing._id,
                status: 'confirmed', // Only check confirmed bookings
                $or: [
                    { startDate: { $lt: req.body.endDate }, endDate: { $gt: req.body.startDate } }
                ]
            });
            if (overlapping) {
                return res.status(400).json({ error: 'This listing is already booked for the selected dates.' });
            }

            // Create booking
            const booking = new bookingSchema({
                user: req.user.id,
                listing: listing._id,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                status: 'pending',
                price: totalPrice,
                paymentOrderId: req.body.paymentOrderId,
            });
            await booking.save();

            res.status(201).json({
                booking,
                totalPrice,
                nights,
                meetingWith: {
                    id: listing.owner._id,
                    name: listing.owner.name,
                    email: listing.owner.email,
                },
                message: 'Booking created. Please proceed to payment.'
            });
        } catch (err) {
            next(err);
        }
    }
);

// Get all bookings for current user
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        console.log(`Fetching bookings for user: ${req.user.id}`);

        const bookings = await bookingSchema.find({ user: req.user.id })
            .populate('listing')
            .sort({ startDate: -1 });

        console.log(`Found ${bookings.length} bookings for user: ${req.user.id}`);

        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        next(err);
    }
});

// Get bookings for a specific listing (for property owners)
router.get('/listing/:listingId', authMiddleware, async (req, res, next) => {
    try {
        const listing = await listingSchema.findById(req.params.listingId);
        if (!listing) return res.status(404).json({ error: 'listingSchema not found' });
        if (!listing.owner.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const bookings = await bookingSchema.find({ listing: listing._id }).populate('user', 'name email');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// Get bookings for a specific property (for property owners)
router.get('/property/:propertyId', authMiddleware, async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        // Verify that the user owns this property
        const listing = await listingSchema.findById(propertyId);
        if (!listing) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (!listing.owner.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized to view bookings for this property' });
        }

        // Fetch all bookings for this property
        const bookings = await bookingSchema
            .find({ listing: propertyId })
            .populate('user', 'name email')
            .populate('listing', 'title')
            .sort({ startDate: 1 });

        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// Get single booking details - this should come AFTER the more specific routes
router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id)
            .populate('listing')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user owns this booking or is the property owner
        if (!booking.user._id.equals(req.user.id) && !booking.listing.owner.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json(booking);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id).populate({
            path: 'listing',
            populate: { path: 'owner', select: 'name email' }
        }).populate('user', 'name email');

        if (!booking) return res.status(404).json({ error: 'bookingSchema not found' });
        if (!booking.user.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Refund if payment was made and booking was confirmed
        let refund = null;
        let refundInfo = null;
        if (booking.status === 'confirmed' && booking.paymentId) {
            refund = await razorpay.payments.refund(booking.paymentId, {
                amount: booking.price * 100 // in paise
            });
            refundInfo = `Refund of ₹${booking.price?.toLocaleString()} has been initiated. It will be processed within 3-5 business days and credited to your original payment method.`;
        }

        booking.status = 'cancelled';
        await booking.save();

        // Import email templates
        const { emailTemplates } = await import('../utils/email.js');

        // Send comprehensive cancellation email to guest
        const guestEmailData = emailTemplates.bookingCancellation(
            booking,
            booking.user,
            refundInfo
        );
        await sendEmail(
            req.user.email,
            guestEmailData.subject,
            guestEmailData.text,
            guestEmailData.html
        );

        // Send cancellation notification email to host
        const hostEmailData = emailTemplates.bookingCancellationHost(
            booking,
            booking.user,
            booking.listing.owner,
            refundInfo
        );
        await sendEmail(
            booking.listing.owner.email,
            hostEmailData.subject,
            hostEmailData.text,
            hostEmailData.html
        );

        res.json({
            message: 'bookingSchema cancelled',
            refund: refund ? 'Refund initiated' : 'No refund (booking not paid or not confirmed)'
        });
    } catch (err) {
        next(err);
    }
});
router.patch('/:id/approve', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id).populate('listing');
        if (!booking) return res.status(404).json({ error: 'bookingSchema not found' });
        if (!booking.listing.owner.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        booking.status = 'confirmed';
        await booking.save();
        res.json({ message: 'bookingSchema approved' });
    } catch (err) {
        next(err);
    }
});
router.post('/:id/confirm', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id).populate({
            path: 'listing',
            populate: { path: 'owner', select: 'name email' }
        }).populate('user', 'name email');

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        booking.status = 'confirmed';
        booking.paymentId = req.body.paymentId;
        await booking.save();

        if (!req.user.email) {
            return res.status(500).json({ error: 'No viewer email defined' });
        }
        if (!booking.listing.owner.email) {
            return res.status(500).json({ error: 'No owner email defined' });
        }

        // Import email templates
        const { emailTemplates } = await import('../utils/email.js');

        // Send comprehensive booking confirmation email to guest
        const guestEmailData = emailTemplates.bookingConfirmation(
            booking,
            booking.user,
            booking.listing.owner
        );
        await sendEmail(
            req.user.email,
            guestEmailData.subject,
            guestEmailData.text,
            guestEmailData.html
        );

        // Send new booking notification email to host
        const hostEmailData = emailTemplates.newBookingHost(
            booking,
            booking.user,
            booking.listing.owner
        );
        await sendEmail(
            booking.listing.owner.email,
            hostEmailData.subject,
            hostEmailData.text,
            hostEmailData.html
        );

        res.json({ message: 'Booking confirmed', booking });
    } catch (err) {
        next(err);
    }
});

// Handle payment failure - cleanup pending booking
router.post('/:id/payment-failed', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (!booking.user.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Find and cleanup all pending bookings with the same payment order ID
        if (booking.status === 'pending') {
            const deletedBookings = await bookingSchema.deleteMany({
                paymentOrderId: booking.paymentOrderId,
                user: req.user.id,
                status: 'pending'
            });

            res.json({
                message: 'Pending bookings cleaned up due to payment failure',
                deletedCount: deletedBookings.deletedCount
            });
        } else {
            res.status(400).json({ error: 'Cannot cleanup non-pending booking' });
        }
    } catch (err) {
        next(err);
    }
});

// Confirm all bookings with the same payment order ID (for multiple room bookings)
router.post('/:id/confirm-payment-order', authMiddleware, async (req, res, next) => {
    console.log('🔄 Confirm payment order endpoint called');
    console.log('Booking ID:', req.params.id);
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);

    try {
        // Get the booking to find the payment order ID
        const mainBooking = await bookingSchema.findById(req.params.id).populate({
            path: 'listing',
            populate: { path: 'owner', select: 'name email' }
        }).populate('user', 'name email');

        console.log('Main booking found:', !!mainBooking);
        if (mainBooking) {
            console.log('Payment order ID:', mainBooking.paymentOrderId);
        }

        if (!mainBooking) return res.status(404).json({ error: 'Booking not found' });

        if (!mainBooking.user.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Find all bookings with the same payment order ID
        const allBookings = await bookingSchema.find({
            paymentOrderId: mainBooking.paymentOrderId,
            user: req.user.id,
            status: 'pending'
        }).populate({
            path: 'listing',
            populate: { path: 'owner', select: 'name email' }
        }).populate('user', 'name email');

        console.log('Found bookings to confirm:', allBookings.length);

        if (allBookings.length === 0) {
            return res.status(400).json({ error: 'No pending bookings found for this payment order' });
        }

        // Confirm all bookings
        const confirmedBookings = [];
        for (const booking of allBookings) {
            booking.status = 'confirmed';
            booking.paymentId = req.body.paymentId;
            await booking.save();
            confirmedBookings.push(booking);
        }

        console.log('✅ Confirmed bookings:', confirmedBookings.length);

        // Import email templates
        const { emailTemplates } = await import('../utils/email.js');

        // Send emails for each confirmed booking
        for (const booking of confirmedBookings) {
            // Send booking confirmation email to guest
            const guestEmailData = emailTemplates.bookingConfirmation(
                booking,
                booking.user,
                booking.listing.owner
            );
            await sendEmail(
                req.user.email,
                guestEmailData.subject,
                guestEmailData.text,
                guestEmailData.html
            );

            // Send new booking notification email to host
            const hostEmailData = emailTemplates.newBookingHost(
                booking,
                booking.user,
                booking.listing.owner
            );
            await sendEmail(
                booking.listing.owner.email,
                hostEmailData.subject,
                hostEmailData.text,
                hostEmailData.html
            );
        }

        // Calculate the total amount from all confirmed bookings
        const totalAmount = confirmedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

        res.json({
            message: 'All bookings confirmed successfully',
            bookings: confirmedBookings,
            totalBookings: confirmedBookings.length,
            totalAmount: totalAmount
        });
    } catch (err) {
        next(err);
    }
});

// Cleanup old pending bookings (older than 30 minutes)
router.post('/cleanup-expired', async (req, res, next) => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const expiredBookings = await bookingSchema.deleteMany({
            status: 'pending',
            createdAt: { $lt: thirtyMinutesAgo }
        });

        res.json({
            message: 'Expired pending bookings cleaned up',
            deletedCount: expiredBookings.deletedCount
        });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/reject', authMiddleware, async (req, res, next) => {
    try {
        const booking = await bookingSchema.findById(req.params.id).populate('listing');
        if (!booking) return res.status(404).json({ error: 'bookingSchema not found' });
        if (!booking.listing.owner.equals(req.user.id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'bookingSchema rejected' });
    } catch (err) {
        next(err);
    }
});

export default router;