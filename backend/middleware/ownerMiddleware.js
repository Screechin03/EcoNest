import listingSchema from '../models/listingModel.js';

const ownerMiddleware = async (req, res, next) => {
    try {
        const listing = await listingSchema.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: 'Listing not found' });
        if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default ownerMiddleware;