/**
 * Utility functions to debug CORS issues in production
 */

// Test an endpoint for CORS issues and return detailed diagnostics
export const testCorsEndpoint = async (url, options = {}) => {
    console.log(`🔍 Testing CORS for: ${url}`);

    try {
        // First, try a simple CORS preflight test
        const preflightResponse = await fetch(url, {
            method: 'OPTIONS',
            mode: 'cors'
        });

        console.log(`✅ Preflight response status: ${preflightResponse.status}`);
        console.log(`✅ CORS headers:`, {
            'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': preflightResponse.headers.get('Access-Control-Allow-Credentials')
        });

        // Next, try the actual request
        const response = await fetch(url, {
            ...options,
            mode: 'cors',
            credentials: 'include'
        });

        console.log(`✅ Actual request status: ${response.status}`);
        if (response.ok) {
            console.log(`✅ Request successful`);
            return {
                success: true,
                message: 'CORS test passed successfully',
                data: await response.json()
            };
        } else {
            console.log(`❌ Request failed with status: ${response.status}`);
            return {
                success: false,
                message: `Request failed with status: ${response.status}`,
                error: await response.text()
            };
        }
    } catch (error) {
        console.error(`❌ CORS test failed:`, error);
        return {
            success: false,
            message: 'CORS test failed',
            error: error.message
        };
    }
};

// Test specifically for CORS with credentials issue
export const testCredentialsCors = async (url) => {
    console.log(`🔍 Testing CORS with different credentials settings for: ${url}`);

    try {
        // Test 1: with credentials: 'include'
        console.log('Test 1: fetch with credentials: include');
        try {
            await fetch(url, {
                mode: 'cors',
                credentials: 'include'
            });
            console.log('✅ credentials:include - Success');
        } catch (err) {
            console.error('❌ credentials:include - Failed:', err.message);
        }

        // Test 2: with credentials: 'same-origin'
        console.log('Test 2: fetch with credentials: same-origin');
        try {
            await fetch(url, {
                mode: 'cors',
                credentials: 'same-origin'
            });
            console.log('✅ credentials:same-origin - Success');
        } catch (err) {
            console.error('❌ credentials:same-origin - Failed:', err.message);
        }

        // Test 3: with credentials: 'omit'
        console.log('Test 3: fetch with credentials: omit');
        try {
            await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });
            console.log('✅ credentials:omit - Success');
        } catch (err) {
            console.error('❌ credentials:omit - Failed:', err.message);
        }

        return {
            success: true,
            message: 'All tests completed, check console for results'
        };
    } catch (error) {
        console.error('❌ Test failed to run:', error);
        return { success: false, error: error.message };
    }
};


// Add this to window for console debugging
if (typeof window !== 'undefined') {
    window.testCorsEndpoint = testCorsEndpoint;
    window.testCredentialsCors = testCredentialsCors;
    window.API_URL = window.location.hostname.includes('localhost')
        ? 'http://localhost:8000/api'
        : 'https://econest-70qt.onrender.com/api';

    console.log(`
    ==============================================
    📣 CORS Debugging Tools Available:
    ==============================================
    
    Run this in console to test a specific endpoint:
    testCorsEndpoint(API_URL + '/stats/cities/popular')
    
    Test for credentials-specific CORS issues:
    testCredentialsCors(API_URL + '/stats/cities/popular')
    
    Available endpoints to test:
    - API_URL + '/stats/cities/popular'
    - API_URL + '/stats/cities'
    - API_URL + '/stats/overview'
    - API_URL + '/listings/popular'
    
    ==============================================
    `);
}

export default testCorsEndpoint;
