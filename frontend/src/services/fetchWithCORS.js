// A reusable fetch wrapper that includes CORS settings
export const fetchWithCORS = async (url, options = {}) => {
    // Add a timestamp to bypass cache for GET requests
    const urlWithCache = options.method === 'GET' || !options.method
        ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
        : url;

    console.log(`Fetching ${options.method || 'GET'} ${url}`);

    // For login/auth endpoints, always use 'omit' to avoid CORS issues
    const isAuthEndpoint = url.includes('/auth/');
    const defaultCredentialsMode = isAuthEndpoint ? 'omit' : 'include';

    const defaultOptions = {
        credentials: options.credentials || defaultCredentialsMode,
        headers: {
            'Content-Type': 'application/json',
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

    console.log('Request options:', {
        method: mergedOptions.method,
        credentials: mergedOptions.credentials,
        headers: Object.keys(mergedOptions.headers)
    });

    try {
        // Use the URL with cache busting parameter for GET requests
        const response = await fetch(urlWithCache, mergedOptions);
        console.log('Response status:', response.status);

        // If response is not ok, try to parse error json
        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                console.error('Could not parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }

        // Parse and return the response data
        const data = await response.json();
        console.log('Response data keys:', Object.keys(data));
        return data;
    } catch (error) {
        console.error('Fetch error:', error);

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
                    console.log('Retry options:', {
                        method: retryOptions.method,
                        credentials: retryOptions.credentials,
                        headers: Object.keys(retryOptions.headers)
                    });

                    const retryResponse = await fetch(urlWithCache, retryOptions);
                    console.log('Retry response status:', retryResponse.status);

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        console.log('Retry successful, response data keys:', Object.keys(data));
                        return data;
                    } else {
                        const errorData = await retryResponse.json().catch(() => ({}));
                        console.error('Retry failed with error data:', errorData);
                    }
                } catch (retryError) {
                    console.error('Retry also failed:', retryError);
                }
            }
        }

        throw error;
    }
};
