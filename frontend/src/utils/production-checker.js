/**
 * Utility module for checking production status of CORS and API connectivity
 */

// Define the backend API URL based on environment
export const API_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:8000/api'
    : 'https://econest-70qt.onrender.com/api';

// Function to check API connectivity
export const checkAPIConnectivity = async () => {
    console.log('🔍 Checking API connectivity to:', API_URL);

    // Try each endpoint with different credentials modes
    const endpoints = [
        '/stats/cities/popular',
        '/stats/cities',
        '/stats/overview',
        '/listings/popular'
    ];

    const results = {};

    for (const endpoint of endpoints) {
        results[endpoint] = {
            withCredentials: 'Testing...',
            withoutCredentials: 'Testing...'
        };

        // Test with credentials: include
        try {
            const withCredentialsResponse = await fetch(`${API_URL}${endpoint}?_t=${Date.now()}`, {
                credentials: 'include'
            });
            results[endpoint].withCredentials = withCredentialsResponse.ok ? 'Success ✅' : `Failed (${withCredentialsResponse.status})`;
        } catch (error) {
            results[endpoint].withCredentials = `Error: ${error.message}`;
        }

        // Test without credentials
        try {
            const withoutCredentialsResponse = await fetch(`${API_URL}${endpoint}?_t=${Date.now()}`, {
                credentials: 'omit'
            });
            results[endpoint].withoutCredentials = withoutCredentialsResponse.ok ? 'Success ✅' : `Failed (${withoutCredentialsResponse.status})`;
        } catch (error) {
            results[endpoint].withoutCredentials = `Error: ${error.message}`;
        }
    }

    // Log results in a table format
    console.log('API Connectivity Results:');
    console.table(results);

    return results;
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
    window.checkAPIConnectivity = checkAPIConnectivity;
    console.log(`
  ==============================================
  📣 Production Status Checker Available:
  ==============================================
  
  Run this in console to check API connectivity:
  checkAPIConnectivity()
  
  This will test all endpoints both with and without credentials
  to help diagnose CORS and connectivity issues.
  
  ==============================================
  `);
}

export default checkAPIConnectivity;
