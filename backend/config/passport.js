import passport from 'passport';
import userSchema from '../models/userMode.js';

const setupPassport = () => {
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