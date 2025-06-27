import { API_URL } from '../config';
import { fetchWithCORS } from './fetchWithCORS';

// Example API service using the centralized API_URL
const apiService = {
    // Auth endpoints
    login: (credentials) =>
        fetchWithCORS(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),

    register: (userData) =>
        fetchWithCORS(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

    // Listings endpoints
    getListings: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return fetchWithCORS(`${API_URL}/listings${queryString ? `?${queryString}` : ''}`);
    },

    // More endpoints can be added here
};

export default apiService;
