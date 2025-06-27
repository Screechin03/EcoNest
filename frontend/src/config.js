// Update API URL config to use environment variables
import.meta.env = import.meta.env || {};

// Define API URLs based on environment
let apiUrl;

// Check if running in development or production
if (import.meta.env.DEV) {
  apiUrl = 'http://localhost:8000/api';
  console.log('Development mode: Using local API', apiUrl);
} else {
  apiUrl = 'https://econest-70qt.onrender.com/api';
  console.log('Production mode: Using remote API', apiUrl);
}

// Export the API URL
export const API_URL = apiUrl;
