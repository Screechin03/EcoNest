import express from 'express';
import Listing from '../models/listingModel.js';

const router = express.Router();

// Get cities with property counts
router.get('/cities', async (req, res) => {
    try {
        // Aggregate listings by city field instead of location
        const cityStats = await Listing.aggregate([
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                    listings: { $push: { 
                        _id: '$_id', 
                        title: '$title', 
                        images: '$images', 
                        price: '$price',
                        area: '$area',
                        state: '$state'
                    }}
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Process cities data
        const processedCities = cityStats.map(city => {
            const cityName = city._id || 'Unknown';
            
            return {
                name: cityName,
                count: city.count,
                searchTerm: cityName.toLowerCase(),
                sampleImage: city.listings[0]?.images[0] || '/listing1.png',
                listings: city.listings,
                state: city.listings[0]?.state || ''
            };
        });

        res.json(processedCities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get popular cities (top 4 for homepage)
router.get('/cities/popular', async (req, res) => {
    try {
        // Get the cities data directly using city field
        const cityStats = await Listing.aggregate([
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                    listings: { $push: { 
                        _id: '$_id', 
                        title: '$title', 
                        images: '$images', 
                        price: '$price',
                        state: '$state'
                    }}
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 4 // Get top 4 cities
            }
        ]);

        // Process and return top cities
        const popularCities = cityStats.map((city, index) => ({
            name: city._id || 'Unknown',
            count: city.count,
            searchTerm: (city._id || 'unknown').toLowerCase(),
            img: city.listings[0]?.images[0] || `/listing${index + 1}.png`,
            state: city.listings[0]?.state || ''
        }));

        res.json(popularCities);
    } catch (error) {
        console.error('Error fetching popular cities:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
                $group: {
                    _id: '$location',
                    count: { $sum: 1 },
                    listings: { $push: { _id: '$_id', title: '$title', images: '$images', price: '$price' } }
                }
            },
            {
                $sort: { count: -1 }
            }
        // Get overall platform statistics
router.get('/overview', async (req, res) => {
    try {
        const totalListings = await Listing.countDocuments();
        const activeListings = await Listing.countDocuments({ status: { $ne: 'inactive' } });

        // Get unique cities count using city field
        const uniqueCities = await Listing.distinct('city');

        // Get average price
        const priceStats = await Listing.aggregate([
            {
                $group: {
                    _id: null,
                    averagePrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        const stats = {
            totalListings,
            activeListings,
            uniqueLocations: uniqueCities.length,
            priceRange: priceStats.length > 0 ? {
                average: Math.round(priceStats[0].averagePrice),
                min: priceStats[0].minPrice,
                max: priceStats[0].maxPrice
            } : null
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats overview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
