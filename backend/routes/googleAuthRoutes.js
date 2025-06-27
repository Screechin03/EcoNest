import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initiate Google OAuth flow
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login?error=google_auth_failed'
    }),
    (req, res) => {
        try {
            // Generate JWT token for the authenticated user
            const token = jwt.sign(
                { id: req.user._id, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // User data to include in response
            const userData = {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                profilePicture: req.user.profilePicture // Include profile picture
            };

            // Build redirect URL with token and user data
            const frontendURL = process.env.NODE_ENV === 'production'
                ? 'https://econest-frontend.onrender.com'
                : 'http://localhost:5173';

            // Redirect to the frontend with token
            res.redirect(`${frontendURL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
        } catch (error) {
            console.error('Google auth error:', error);
            res.redirect('/login?error=auth_failed');
        }
    }
);

export default router;