import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { fetchWithCORS } from '../services/fetchWithCORS';
import { popularCitiesFallback } from '../utils/fallbackData';

const PopularCities = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPopularCities();
    }, []);

    const fetchPopularCities = async () => {
        try {
            // Using fetchWithCORS helper instead of direct fetch
            const data = await fetchWithCORS(`${API_URL}/stats/cities/popular`)
                .catch(error => {
                    console.warn('Falling back to static data due to API error:', error);
                    throw error; // Re-throw to trigger the fallback
                });

            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Fallback to static data
            setCities(popularCitiesFallback);
        } finally {
            setLoading(false);
        }
    };

    const handleCityClick = (city) => {
        // Navigate to bookings page with city filter
        navigate(`/bookings?location=${encodeURIComponent(city.searchTerm)}`);
    };

    const handleExploreAll = () => {
        navigate('/cities');
    };

    if (loading) {
        return (
            <section className="w-full py-16 px-4 md:px-16 bg-white">
                <div className="flex items-center justify-center">
                    <div className="text-lg text-gray-600">Loading popular cities...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-16 px-4 md:px-16 bg-white">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-5xl font-bold">Popular Cities</h2>
                <button
                    onClick={handleExploreAll}
                    className="border border-black rounded-full px-6 py-2 text-lg font-medium hover:bg-black hover:text-white transition"
                >
                    Explore All <span className="ml-1">↗</span>
                </button>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                {cities.map((city) => (
                    <div
                        key={city.name}
                        className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
                        onClick={() => handleCityClick(city)}
                    >
                        <img
                            src={city.img}
                            alt={city.name}
                            className="w-64 h-64 object-cover rounded-full mb-6 shadow group-hover:shadow-lg transition-shadow"
                        />
                        <div className="text-2xl font-semibold group-hover:text-green-600 transition-colors">{city.name}</div>
                        <div className="text-gray-500 text-lg">{city.count} {city.count === 1 ? 'Property' : 'Properties'}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PopularCities;