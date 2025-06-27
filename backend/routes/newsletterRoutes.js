import express from 'express';
import Newsletter from '../models/newsletterModel.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address',
                    errors: errors.array()
                });
            }

            const { email } = req.body;

            // Check if email already exists
            const existingSubscription = await Newsletter.findOne({ email });
            if (existingSubscription) {
                if (existingSubscription.isActive) {
                    return res.status(409).json({
                        success: false,
                        message: 'This email is already subscribed to our newsletter'
                    });
                } else {
                    // Reactivate subscription
                    existingSubscription.isActive = true;
                    existingSubscription.subscribedAt = new Date();
                    await existingSubscription.save();

                    return res.status(200).json({
                        success: true,
                        message: 'Welcome back! Your subscription has been reactivated.'
                    });
                }
            }

            // Create new subscription
            const newsletter = new Newsletter({ email });
            await newsletter.save();

            res.status(201).json({
                success: true,
                message: 'Thank you for subscribing! You\'ll receive the latest property updates.'
            });

        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }
            next(error);
        }
    }
);

// Unsubscribe from newsletter
router.post('/unsubscribe',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address',
                    errors: errors.array()
                });
            }

            const { email } = req.body;

            const subscription = await Newsletter.findOne({ email });
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'Email not found in our newsletter list'
                });
            }

            subscription.isActive = false;
            await subscription.save();

            res.status(200).json({
                success: true,
                message: 'You have been successfully unsubscribed from our newsletter'
            });

        } catch (error) {
            next(error);
        }
    }
);

// Get newsletter statistics (optional - for admin)
router.get('/stats', async (req, res, next) => {
    try {
        const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
        const totalSubscriptions = await Newsletter.countDocuments();
        const recentSubscribers = await Newsletter.find({ isActive: true })
            .sort({ subscribedAt: -1 })
            .limit(10)
            .select('email subscribedAt');

        res.status(200).json({
            success: true,
            data: {
                totalSubscribers,
                totalSubscriptions,
                recentSubscribers
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
