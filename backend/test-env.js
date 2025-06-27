import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing environment variables for Google OAuth:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET || 'Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET || 'Not set');
