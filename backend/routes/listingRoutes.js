import express from 'express';
import listingSchema from '../models/listingModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerMiddleware from '../middleware/ownerMiddleware.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'EcoNest/listings',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});
const upload = multer({ storage });

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    upload.array('images'),
    [
        body('title').notEmpty(),
        body('price').isNumeric(),
        body('location').notEmpty(),
        body('tags').optional().isArray(),
        body('tags.*').optional().isString(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            // Cloudinary returns an array of file objects with a path property (the URL)
            const images = req.files ? req.files.map(file => file.path) : [];
            console.log(req.files);

            const listing = new listingSchema({
                ...req.body,
                images,
                owner: req.user.id,
            });
            await listing.save();
            res.status(201).json(listing);
        } catch (err) {
            next(err);
        }
    }
);


router.get('/', async (req, res, next) => {
    try {
        const { title, tags, location, minPrice, maxPrice } = req.query;
        const filter = {};
        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (tags) {
            // tags=airport,landmark (comma-separated)
            filter.tags = { $in: tags.split(',') };
        }
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const listings = await listingSchema.find(filter).populate('owner', 'name email');
        res.json(listings);
    } catch (err) {
        next(err);
    }
});

// Get popular listings with pagination
router.get('/popular', async (req, res, next) => {
    try {
        const { page = 0, limit = 6 } = req.query;
        const skip = parseInt(page) * parseInt(limit);

        const listings = await listingSchema
            .find({ isPopular: true })
            .populate('owner', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await listingSchema.countDocuments({ isPopular: true });
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            listings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalListings: total,
                hasNextPage: parseInt(page) < totalPages - 1,
                hasPrevPage: parseInt(page) > 0
            }
        });
    } catch (err) {
        next(err);
    }
});

// Check availability for listings with date range
router.get('/availability', async (req, res, next) => {
    try {
        const { startDate, endDate, title, tags, location, minPrice, maxPrice } = req.query;

        // Build listing filter
        const filter = {};
        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const listings = await listingSchema.find(filter).populate('owner', 'name email');

        // If no date range provided, return all listings without booking status
        if (!startDate || !endDate) {
            return res.json(listings.map(listing => ({
                ...listing.toObject(),
                isBooked: false
            })));
        }

        // Check booking status for each listing within the date range
        const bookingSchema = (await import('../models/bookingModel.js')).default;

        const listingsWithAvailability = await Promise.all(
            listings.map(async (listing) => {
                const overlappingBooking = await bookingSchema.findOne({
                    listing: listing._id,
                    status: { $in: ['pending', 'confirmed'] }, // Only active bookings
                    $or: [
                        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
                    ]
                });

                return {
                    ...listing.toObject(),
                    isBooked: !!overlappingBooking
                };
            })
        );

        res.json(listingsWithAvailability);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const listing = await listingSchema.findById(req.params.id).populate('owner', 'name email');
        if (!listing) return res.status(404).json({ error: 'listingSchema not found' });
        res.json(listing);
    } catch (err) {
        next(err);
    }
});

// Get all properties by a specific host/owner
router.get('/host/:hostId', async (req, res, next) => {
    try {
        const { hostId } = req.params;
        const { excludePropertyId } = req.query; // Optional: exclude current property from results

        const filter = { owner: hostId };

        // Exclude current property if specified
        if (excludePropertyId) {
            filter._id = { $ne: excludePropertyId };
        }

        const listings = await listingSchema.find(filter)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (err) {
        next(err);
    }
});

// Update a listing
router.put(
    '/:id',
    authMiddleware,
    [
        body('title').optional().notEmpty(),
        body('price').optional().isNumeric(),
        body('location').optional().notEmpty(),
        body('tags').optional().isArray(),
        body('tags.*').optional().isString(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const listing = await listingSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!listing) return res.status(404).json({ error: 'listingSchema not found' });
            res.json(listing);
        } catch (err) {
            next(err);
        }
    }
);

// Delete a listing
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const listing = await listingSchema.findByIdAndDelete(req.params.id);
        if (!listing) return res.status(404).json({ error: 'listingSchema not found' });
        res.json({ message: 'listingSchema deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;