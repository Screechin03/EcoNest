import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userSchema from '../models/userMode.js';

const setupPassport = () => {    // Debug logs for environment variables
    console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
    
    // Configure Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://econest-70qt.onrender.com/api/auth/google/callback'
            : 'http://localhost:8000/api/auth/google/callback',
        scope: ['profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find existing user by Google ID
                let user = await userSchema.findOne({ googleId: profile.id });

                // If user not found by Google ID, try to find by email
                if (!user && profile.emails && profile.emails.length > 0) {
                    const email = profile.emails[0].value;
                    user = await userSchema.findOne({ email });

                    // If user exists by email but no Google ID, update with Google details
                    if (user) {
                        user.googleId = profile.id;
                        if (profile.photos && profile.photos.length > 0) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                    }
                }

                // If no user found, create a new user
                if (!user) {
                    // Get user details from Google profile
                    const email = profile.emails && profile.emails.length > 0
                        ? profile.emails[0].value
                        : '';

                    const profilePicture = profile.photos && profile.photos.length > 0
                        ? profile.photos[0].value
                        : '';

                    // Create new user
                    user = new userSchema({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        profilePicture,
                        role: 'viewer' // Default role for Google auth users
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }));

    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userSchema.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    return passport;
};

export default setupPassport;