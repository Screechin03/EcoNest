import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct path to .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Load environment variables from the specified path
dotenv.config({ path: envPath });

// Check critical environment variables
console.log('Environment Variable Check:');
console.log('---------------------------');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set (will default to development)');
console.log('---------------------------');

// Try to extract first few characters of secrets to verify they're not empty
if (process.env.GOOGLE_CLIENT_ID) {
    console.log('GOOGLE_CLIENT_ID starts with:', process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...');
}

if (process.env.GOOGLE_CLIENT_SECRET) {
    console.log('GOOGLE_CLIENT_SECRET starts with:', process.env.GOOGLE_CLIENT_SECRET.substring(0, 8) + '...');
}

console.log('---------------------------');
console.log('Note: If running in production, make sure these variables');
console.log('are correctly set in your environment or .env file.');
