import jwt from 'jsonwebtoken';
import User from '../models/userMode.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authentication failed: No token provided or incorrect format');
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch the full user object from DB
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log(`Authentication failed: User not found for ID: ${decoded.id}`);
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user; // Attach full user object (with email)
        console.log(`Authentication successful for user: ${user.email} (${user._id})`);
        next();
    } catch (err) {
        console.log('Authentication failed: Invalid token', err.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default authMiddleware;