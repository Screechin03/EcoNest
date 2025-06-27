// A reusable fetch wrapper that includes CORS settings
export const fetchWithCORS = async (url, options = {}) => {
    // Add a timestamp to bypass cache for GET requests
    const urlWithCache = options.method === 'GET' || !options.method
        ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
        : url;

    // Default credentials mode - switch to 'omit' to avoid CORS issues in production
    // This is a global toggle that can be set based on environment
    const defaultCredentialsMode = window.location.hostname.includes('localhost') ? 'include' : 'omit';

    const defaultOptions = {
        credentials: options.credentials || defaultCredentialsMode, // Adaptive credentials mode
        headers: {
            'Content-Type': 'application/json',
            // Add CORS-specific headers that might help
            'Accept': 'application/json',
            ...options.headers
        },
        mode: 'cors' // Explicitly set CORS mode
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        // Use the URL with cache busting parameter for GET requests
        const response = await fetch(urlWithCache, mergedOptions);

        // If response is not ok, throw an error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Parse and return the response data
        return await response.json();
    } catch (error) {
        // Special handling for CORS errors
        if (error.message.includes('NetworkError') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('CORS')) {
            console.error('CORS error detected:', error);

            // If the error mentions credentials or Access-Control-Allow-Origin wildcard issues,
            // retry the request without credentials
            if (error.message.includes('credentials') ||
                error.message.includes('Access-Control-Allow-Origin') ||
                error.message.includes('wildcard')) {
                console.warn('Retrying request without credentials...');
                try {
                    const retryOptions = {
                        ...mergedOptions,
                        credentials: 'omit'
                    };
                    const retryResponse = await fetch(urlWithCache, retryOptions);
                    if (retryResponse.ok) {
                        return await retryResponse.json();
                    }
                } catch (retryError) {
                    console.error('Retry also failed:', retryError);
                    // Continue to fallback data
                }
            }
        }

        console.error('Fetch error:', error);
        throw error;
    }
};

export default fetchWithCORS;
