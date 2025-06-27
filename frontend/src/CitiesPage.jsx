import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { API_URL } from './config';
import { fetchWithCORS } from './services/fetchWithCORS';
import { citiesFallback, statsOverviewFallback } from './utils/fallbackData';

const CitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCities();
        fetchStats();
    }, []);

    useEffect(() => {
        // Filter cities based on search term
        if (searchTerm.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter(city =>
                city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCities(filtered);
        }
    }, [searchTerm, cities]);

    const fetchCities = async () => {
        try {
            const data = await fetchWithCORS(`${API_URL}/stats/cities`)
                .catch(error => {
                    console.warn('Error fetching cities, using fallback:', error);
                    return citiesFallback; // Use imported fallback data
                });

            setCities(data);
            setFilteredCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Use fallback data in catch block too
            setCities(citiesFallback);
            setFilteredCities(citiesFallback);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await fetchWithCORS(`${API_URL}/stats/overview`)
                .catch(error => {
                    console.warn('Error fetching stats, using fallback:', error);
                    return statsOverviewFallback; // Use imported fallback data
                });
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Use fallback data in catch block too
            setStats(statsOverviewFallback);
        }
    };

    const handleCityClick = (city) => {
        navigate(`/bookings?location=${encodeURIComponent(city.searchTerm)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading cities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Cities</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover amazing properties across India. From bustling metropolitan cities to serene suburban areas.
                        </p>
                    </div>

                    {/* Stats Overview */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-green-50 rounded-lg p-6 text-center">
                                <div className="text-3xl font-bold text-green-600">{stats.totalListings}</div>
                                <div className="text-gray-600">Total Properties</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.uniqueLocations}</div>
                                <div className="text-gray-600">Unique Locations</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-6 text-center">
                                <div className="text-3xl font-bold text-purple-600">{filteredCities.length}</div>
                                <div className="text-gray-600">Cities Available</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-6 text-center">
                                <div className="text-3xl font-bold text-orange-600">
                                    ₹{stats.priceRange?.average?.toLocaleString() || 'N/A'}
                                </div>
                                <div className="text-gray-600">Average Price</div>
                            </div>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for cities or areas..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cities Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {filteredCities.length === 0 ? (
                    <div className="text-center py-12">
                        <FaMapMarkerAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-600 mb-2">No cities found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCities.map((city, index) => (
                            <div
                                key={city.name}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
                                onClick={() => handleCityClick(city)}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={city.sampleImage}
                                        alt={city.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = `/listing${(index % 6) + 1}.png`;
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {city.count} {city.count === 1 ? 'Property' : 'Properties'}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                        {city.name}
                                        {city.state && (
                                            <span className="text-lg font-normal text-gray-600 ml-2">
                                                , {city.state}
                                            </span>
                                        )}
                                    </h3>

                                    {/* Show sample areas from listings */}
                                    {city.listings && city.listings.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 font-medium mb-2">Available Properties:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {city.listings.slice(0, 3).map((listing, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-green-100 hover:text-green-700 cursor-pointer transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/listing/${listing._id}`);
                                                        }}
                                                    >
                                                        {listing.title.length > 25 ? `${listing.title.substring(0, 25)}...` : listing.title}
                                                    </span>
                                                ))}
                                                {city.listings.length > 3 && (
                                                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                        +{city.listings.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sample listings preview */}
                                    {city.listings && city.listings.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 font-medium mb-2">Price Range:</p>
                                            <div className="text-lg font-semibold text-green-600">
                                                ₹{Math.min(...city.listings.map(l => l.price)).toLocaleString()} -
                                                ₹{Math.max(...city.listings.map(l => l.price)).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCityClick(city);
                                        }}
                                    >
                                        Explore Properties
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CitiesPage;
