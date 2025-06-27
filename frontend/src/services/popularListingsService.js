// API service for popular listings
import { API_URL } from '../config';

export const popularListingsService = {
    // Get popular listings with pagination
    getPopularListings: async (page = 0, limit = 6) => {
        try {
            const response = await fetch(`${API_URL}/listings/popular?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching popular listings:', error);
            throw error;
        }
    },

    // Get all popular listings
    getAllPopularListings: async () => {
        try {
            const response = await fetch(`${API_URL}/listings/popular?limit=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching all popular listings:', error);
            throw error;
        }
    },

    // Get a specific listing by ID
    getListingById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/listings/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching listing:', error);
            throw error;
        }
    }
};
