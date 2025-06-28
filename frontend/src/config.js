// Production API URL by default
let apiUrl = 'https://econest-70qt.onrender.com/api';

// Check if running in development based on environment
// We can't modify import.meta.env, but we can read from it
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  apiUrl = 'http://localhost:8000/api';
  console.log('Development mode: Using local API', apiUrl);
} else {
  console.log('Production mode: Using remote API', apiUrl);
}

// Export the API URL
export const API_URL = apiUrl;
