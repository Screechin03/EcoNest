/**
 * This script detects and handles navigation errors in the SPA
 * It helps prevent or diagnose "Not Found" errors when double-loading pages
 * 
 * Enhanced version with Render-specific 404 handling
 */

// Store the last attempted navigation URL to detect double-loading
let lastNavigationUrl = '';
let navigationTimestamp = 0;
let validRoutes = [
    '/',
    '/login',
    '/register',
    '/bookings',
    '/listing',
    '/my-bookings',
    '/owner-bookings',
    '/booking-summary',
    '/cities',
    '/contact',
    '/createListing'
];

// Pattern for dynamic routes like /listing/:id
const dynamicRoutePatterns = [
    { pattern: /^\/listing\/[a-zA-Z0-9]+$/, base: '/listing' },
    { pattern: /^\/booking\/[a-zA-Z0-9]+$/, base: '/booking' }
];

// Function to check if a path matches our valid routes
const isValidRoute = (path) => {
    // Check static routes
    if (validRoutes.includes(path)) return true;

    // Check dynamic routes
    for (const { pattern } of dynamicRoutePatterns) {
        if (pattern.test(path)) return true;
    }

    return false;
};

// Function to track navigation events
const trackNavigation = () => {
    // Handle 404 errors immediately on page load
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && !isValidRoute(currentPath)) {
        console.warn(`Potentially invalid route detected: ${currentPath}, trying to recover...`);

        // Attempt to find base route for dynamic paths
        for (const { pattern, base } of dynamicRoutePatterns) {
            if (pattern.test(currentPath)) {
                window.history.replaceState(null, '', base);
                window.location.reload();
                return;
            }
        }
    }

    // Track navigation events
    window.addEventListener('popstate', (event) => {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        const now = Date.now();

        console.log(`Navigation detected: ${currentUrl}`);

        // Check if this is a double navigation to the same URL within 1 second
        if (currentUrl === lastNavigationUrl && now - navigationTimestamp < 1000) {
            console.warn('Double navigation detected! This could cause "Not Found" errors');

            // Prevent the default navigation behavior
            event.preventDefault();

            // Force a proper navigation to the correct route
            window.history.pushState(null, '', currentUrl);

            // Dispatch a custom event that React Router can listen to
            window.dispatchEvent(new Event('popstate'));
        }

        // Check if the path is valid
        if (!isValidRoute(currentPath) && currentPath !== '/') {
            console.warn(`Invalid route detected: ${currentPath}, redirecting to homepage`);
            window.history.replaceState(null, '', '/');
            window.location.reload();
            return;
        }

        // Update tracking variables
        lastNavigationUrl = currentUrl;
        navigationTimestamp = now;
    });
};

// Function to enhance page reload behavior with Render-specific handling
const enhanceReload = () => {
    // Store the current URL in sessionStorage before page unloads
    window.addEventListener('beforeunload', () => {
        const currentPath = window.location.pathname;
        // Only store valid routes to prevent storing 404 URLs
        if (isValidRoute(currentPath) || currentPath === '/') {
            sessionStorage.setItem('lastVisitedUrl', currentPath + window.location.search);
            sessionStorage.setItem('lastVisitedTimestamp', Date.now().toString());
        }
    });

    // Special handling for Render/Netlify - check URL hash for 404 redirect
    if (window.location.hash && window.location.hash.length > 1) {
        const pathFromHash = window.location.hash.substring(1); // Remove # character
        console.log(`Detected path in hash: ${pathFromHash}`);

        // Check if this is a valid route before restoring
        if (isValidRoute(pathFromHash)) {
            console.log(`Restoring navigation from hash to: ${pathFromHash}`);
            window.history.replaceState(null, '', pathFromHash);
            window.location.reload();
            return;
        }
    }

    // Check if we need to restore URL on page load
    const lastUrl = sessionStorage.getItem('lastVisitedUrl');
    const lastTimestamp = sessionStorage.getItem('lastVisitedTimestamp');
    const currentTimestamp = Date.now();

    if (lastUrl) {
        const currentPath = window.location.pathname;

        // If we got a 404 (often '/' after a refresh instead of the actual page)
        // Only restore if the URL was saved recently (within 1 hour)
        const isRecentNavigation = lastTimestamp && (currentTimestamp - parseInt(lastTimestamp) < 3600000);

        if (currentPath !== lastUrl && (currentPath === '/' || currentPath === '/404' || currentPath === '/404.html') && isRecentNavigation) {
            console.log(`Restoring navigation to: ${lastUrl}`);

            // Use history API to update URL without refreshing
            window.history.replaceState(null, '', lastUrl);

            // Also force a reload if we're coming from a 404
            if (currentPath === '/404' || currentPath === '/404.html') {
                window.location.reload();
                return;
            }
        }
    }
};

// Initialize navigation handling
if (typeof window !== 'undefined') {
    console.log('Navigation handler initialized');
    trackNavigation();
    enhanceReload();

    // Expose utility functions for debugging
    window.debugNavigation = {
        getLastNavigation: () => ({ url: lastNavigationUrl, time: navigationTimestamp }),
        forceNavigate: (path) => {
            window.history.pushState(null, '', path);
            window.dispatchEvent(new Event('popstate'));
        }
    };
}

export default {
    trackNavigation,
    enhanceReload
};
