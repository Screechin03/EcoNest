import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userSchema from '../models/userMode.js';

const router = express.Router();


router.post('/register', async (req, res) => {
    const { name, email, password, role, phone, currentAddress } = req.body;
    try {
        // Check if user already exists
        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email already exists. Please log in instead.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userSchema({ name, email, password: hashedPassword, role: role || 'viewer', phone, currentAddress });
        await user.save();

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userSchema.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;