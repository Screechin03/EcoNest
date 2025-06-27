import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order
router.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;