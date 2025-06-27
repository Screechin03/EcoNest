import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js'; // MongoDB connection
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import setupPassport from './config/passport.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bookingSchema from './models/bookingModel.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });
// Initialize environment variables early
connectDB();

const app = express();
// For backward compatibility with path.join() calls later in the code
const rootDir = path.resolve();

// Configure CORS for production
const allowedOrigins = [
    'http://localhost:5173', // Local development frontend
    'https://econest.onrender.com', // Production frontend URL
    'https://econest-frontend.onrender.com', // Current production frontend URL
    'https://econest-70qt.onrender.com', // Backend URL (exact URL)
    'https://boulevard.onrender.com', // New Boulevard frontend URL
    'https://boulevard-frontend.onrender.com', // Alternative Boulevard frontend URL
    // Allow all subdomains of onrender.com for development flexibility
    /\.onrender\.com$/
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if the origin is in our allowed list
        if (allowedOrigins.includes(origin) ||
            origin.match(/\.onrender\.com$/)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for now, but log unexpected ones
            console.log(`Unexpected origin: ${origin}`);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Additional CORS headers middleware as a backup
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Set the specific origin instead of wildcard when credentials are used
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(express.json());

// Session setup (required for passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'econest-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60, // = 1 day
        touchAfter: 24 * 3600 // Only update session once per day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Debug environment variables
console.log('Environment check for Google OAuth:');
console.log('- SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');

// Initialize passport
const passport = setupPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Google auth routes
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contact', contactRoutes);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Cleanup expired pending bookings every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const result = await bookingSchema.deleteMany({
            status: 'pending',
            createdAt: { $lt: thirtyMinutesAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} expired pending bookings`);
        }
    } catch (error) {
        console.error('Error cleaning up expired bookings:', error);
    }
});
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the frontend build directory if they exist
    // This is just a fallback - we'll be using separate deployments for frontend and backend
    const frontendBuildPath = path.join(rootDir, '../frontend/dist');
    if (fs.existsSync(frontendBuildPath)) {
        app.use(express.static(frontendBuildPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(frontendBuildPath, 'index.html'));
        });
    } else {
        // API-only mode
        app.get('/', (req, res) => {
            res.send('Boulevard API is running. Frontend is deployed separately.');
        });
    }
}
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
