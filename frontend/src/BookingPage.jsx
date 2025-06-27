import React, { useEffect, useState } from 'react';
import PropertyDetails from './PropertyDetails';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaMap, FaTimes, FaStar } from 'react-icons/fa';
import TagDisplay from './components/TagDisplay';
import TagFilter from './components/TagFilter';
import PopularTags from './components/PopularTags';
import TagCount from './components/TagCount';
import { validateTags, calculatePopularTags } from './utils/tagUtils';
import { API_URL } from './config';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to get coordinates from location string
const getCoordinatesFromLocation = (location) => {
    // Simple geocoding for common Indian cities (in a real app, use a proper geocoding service)
    const locationMap = {
        'mumbai': [19.0760, 72.8777],
        'delhi': [28.6139, 77.2090],
        'bangalore': [12.9716, 77.5946],
        'chennai': [13.0827, 80.2707],
        'hyderabad': [17.3850, 78.4867],
        'pune': [18.5204, 73.8567],
        'kolkata': [22.5726, 88.3639],
        'ahmedabad': [23.0225, 72.5714],
        'jaipur': [26.9124, 75.7873],
        'surat': [21.1702, 72.8311],
    };

    const locationLower = location.toLowerCase();
    for (const [city, coords] of Object.entries(locationMap)) {
        if (locationLower.includes(city)) {
            return coords;
        }
    }

    // Default to Mumbai if location not found
    return [19.0760, 72.8777];
};

// Reusable BookingBar component (similar to PropertyDetails)
const FilterBar = ({ rooms, setRooms, onSearch, tags, selectedTags, setSelectedTags, searchFilters, setSearchFilters }) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Track which room's date picker is open
    const [openPickerIdx, setOpenPickerIdx] = useState(null);

    const handleRoomChange = (idx, field, value) => {
        setRooms(rooms =>
            rooms.map((room, i) =>
                i === idx ? { ...room, [field]: value } : room
            )
        );
    };

    const handleDateRangeChange = (idx, ranges) => {
        const { startDate, endDate } = ranges.selection;
        handleRoomChange(idx, 'startDate', startDate);
        handleRoomChange(idx, 'endDate', endDate);
    };

    const handleTagToggle = (tag) => {
        // Toggle tag selection with proper normalization
        const normalizedTag = tag.trim();
        if (!normalizedTag) return;

        setSelectedTags(prev => {
            // If tag already exists, remove it (toggle behavior)
            if (prev.includes(normalizedTag)) {
                return prev.filter(t => t !== normalizedTag);
            }
            // Otherwise add it
            return [...prev, normalizedTag];
        });
    };

    const handleFilterChange = (field, value) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Format date as "7 Apr"
    const formatShortDate = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

    return (
        <div className="w-full bg-white rounded-xl border border-indigo-200 flex flex-col gap-4 px-4 py-6 mb-8 shadow-sm">
            {/* Search Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        placeholder="Enter city or area"
                        value={searchFilters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                        value={searchFilters.propertyType}
                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="house">House</option>
                        <option value="studio">Studio</option>
                        <option value="penthouse">Penthouse</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                        type="number"
                        placeholder="₹ Min"
                        value={searchFilters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                        type="number"
                        placeholder="₹ Max"
                        value={searchFilters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            {/* Date and Guest Selection */}
            {rooms.map((room, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 w-full relative">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold mr-2">Search for</span>
                        <select
                            className="bg-transparent outline-none font-medium"
                            value={room.adults}
                            onChange={e => handleRoomChange(idx, 'adults', Number(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Adults</option>)}
                        </select>
                        <select
                            className="bg-transparent outline-none font-medium"
                            value={room.children}
                            onChange={e => handleRoomChange(idx, 'children', Number(e.target.value))}
                        >
                            {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Children</option>)}
                        </select>
                        {/* Date Range Button */}
                        <button
                            type="button"
                            className="ml-2 px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100 font-medium text-indigo-700"
                            onClick={() => setOpenPickerIdx(openPickerIdx === idx ? null : idx)}
                        >
                            {formatShortDate(room.startDate ? new Date(room.startDate) : today)}
                            {' '}
                            <span className="mx-1">{'>'}</span>
                            {' '}
                            {formatShortDate(room.endDate ? new Date(room.endDate) : tomorrow)}
                        </button>
                        {rooms.length > 1 && (
                            <button
                                className="ml-2 text-gray-400 hover:text-red-500"
                                onClick={() => setRooms(rooms => rooms.length > 1 ? rooms.filter((_, i) => i !== idx) : rooms)}
                                type="button"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {/* Date Range Popover */}
                    {openPickerIdx === idx && (
                        <div className="absolute left-0 md:left-auto md:right-0 bg-white border rounded-xl shadow-lg p-2 z-20" style={{ top: '60px' }}>
                            <DateRange
                                ranges={[{
                                    startDate: room.startDate ? new Date(room.startDate) : today,
                                    endDate: room.endDate ? new Date(room.endDate) : tomorrow,
                                    key: 'selection'
                                }]}
                                minDate={today}
                                onChange={ranges => {
                                    handleDateRangeChange(idx, ranges);
                                }}
                                rangeColors={["#4f46e5"]}
                                showDateDisplay={false}
                                moveRangeOnFirstSelection={false}
                            />
                            <button
                                className="block mx-auto mt-2 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                onClick={() => setOpenPickerIdx(null)}
                                type="button"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Tag Filters */}
            {tags.length > 0 && (
                <div className="border-t pt-4">
                    <TagFilter
                        availableTags={tags}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                    />
                </div>
            )}

            {/* Search Button */}
            <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-4">
                    <button
                        className="text-indigo-600 hover:underline text-sm"
                        type="button"
                        onClick={() =>
                            setRooms(rooms => [
                                ...rooms,
                                { adults: 1, children: 0, startDate: today, endDate: tomorrow }
                            ])
                        }
                    >
                        + Add Room
                    </button>
                    <button
                        className="text-gray-600 hover:underline text-sm"
                        type="button"
                        onClick={() => {
                            setSearchFilters({ location: '', propertyType: '', minPrice: '', maxPrice: '' });
                            setSelectedTags([]);
                            setRooms([{ adults: 1, children: 0, startDate: today, endDate: tomorrow }]);
                        }}
                    >
                        Clear All Filters
                    </button>
                </div>
                <button
                    onClick={onSearch}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
                >
                    Search Properties
                </button>
            </div>
        </div>
    );
};
const BookingPage = () => {
    const [properties, setProperties] = useState([]);
    const [propertyReviews, setPropertyReviews] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [mapViewProperty, setMapViewProperty] = useState(null); // For map modal
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        propertyType: '',
        minPrice: '',
        maxPrice: ''
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Date filter state (similar to PropertyDetails)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const [rooms, setRooms] = useState([
        { adults: 1, children: 0, startDate: today, endDate: tomorrow }
    ]);

    useEffect(() => {
        // Check for URL search parameters from homepage or popular cities
        const urlParams = new URLSearchParams(location.search);
        const searchParams = {};
        const newSearchFilters = { ...searchFilters };

        if (urlParams.get('location')) {
            searchParams.location = urlParams.get('location');
            newSearchFilters.location = urlParams.get('location');
        }
        if (urlParams.get('type')) {
            searchParams.tags = [urlParams.get('type')];
            newSearchFilters.propertyType = urlParams.get('type');
        }
        if (urlParams.get('maxPrice')) {
            searchParams.maxPrice = urlParams.get('maxPrice');
            newSearchFilters.maxPrice = urlParams.get('maxPrice');
        }
        if (urlParams.get('city')) {
            searchParams.location = urlParams.get('city');
            newSearchFilters.location = urlParams.get('city');
        }

        setSearchFilters(newSearchFilters);

        // Fetch properties with search parameters or without
        fetchProperties(searchParams);
    }, [location.search]);

    const fetchProperties = async (searchParams = {}) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            // Add search parameters
            if (searchParams.startDate) queryParams.append('startDate', searchParams.startDate);
            if (searchParams.endDate) queryParams.append('endDate', searchParams.endDate);
            if (searchParams.tags && searchParams.tags.length > 0) {
                queryParams.append('tags', searchParams.tags.join(','));
            }
            if (searchParams.location) queryParams.append('location', searchParams.location);
            if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
            if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
            if (searchParams.propertyType) queryParams.append('tags', searchParams.propertyType);

            const url = searchParams.startDate || searchParams.endDate || searchParams.tags?.length > 0 || searchParams.location || searchParams.maxPrice || searchParams.minPrice || searchParams.propertyType
                ? `${API_URL}/listings/availability?${queryParams.toString()}`
                : `${API_URL}/listings`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProperties(data);

            // Process and calculate tag information
            // Validate all property tags
            data.forEach(property => {
                if (property.tags) {
                    property.tags = validateTags(property.tags);
                }
            });

            // Extract unique sorted tags
            const allUniqueTags = [...new Set(
                data.flatMap(property => property.tags || [])
            )].sort();

            setAllTags(allUniqueTags);

            // Find most used tags for quick filters
            const popularTagsData = calculatePopularTags(data, 8);
            setPopularTags(popularTagsData);

            // Fetch review stats for all properties
            fetchPropertyReviews(data);
        } catch (err) {
            setProperties([]);
            setAllTags([]);
        }
        setLoading(false);
    };

    const fetchPropertyReviews = async (propertiesData) => {
        const reviewsData = {};

        // Fetch review stats for each property
        for (const property of propertiesData) {
            try {
                const res = await fetch(`${API_URL}/reviews/listing/${property._id}?limit=1`);
                if (res.ok) {
                    const data = await res.json();
                    reviewsData[property._id] = data.stats;
                }
            } catch (error) {
                console.error(`Error fetching reviews for property ${property._id}:`, error);
                // Fallback to dynamic rating based on property ID
                reviewsData[property._id] = {
                    averageRating: 3.5 + (parseInt(property._id?.slice(-1), 16) % 3) * 0.3,
                    totalReviews: 8 + (parseInt(property._id?.slice(-2), 16) % 25)
                };
            }
        }

        setPropertyReviews(reviewsData);
    };

    const handleSearch = () => {
        const searchParams = {};

        // Add filter parameters
        if (searchFilters.location) searchParams.location = searchFilters.location;
        if (searchFilters.propertyType) searchParams.propertyType = searchFilters.propertyType;
        if (searchFilters.minPrice) searchParams.minPrice = searchFilters.minPrice;
        if (searchFilters.maxPrice) searchParams.maxPrice = searchFilters.maxPrice;

        // Get date range from first room (for simplicity)
        if (rooms.length > 0) {
            const room = rooms[0];
            if (room.startDate) searchParams.startDate = new Date(room.startDate).toISOString();
            if (room.endDate) searchParams.endDate = new Date(room.endDate).toISOString();
        }

        if (selectedTags.length > 0) {
            searchParams.tags = selectedTags;
        }

        fetchProperties(searchParams);
    };

    if (selectedProperty) {
        return (
            <PropertyDetails
                property={selectedProperty}
                onBack={() => setSelectedProperty(null)}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 mt-24">
            <h1 className="text-3xl font-bold mb-8 text-green-700 text-center">Find Your Perfect Stay</h1>

            {/* Filter Bar */}
            <FilterBar
                rooms={rooms}
                setRooms={setRooms}
                onSearch={handleSearch}
                tags={allTags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
            />

            {/* Results Count and Filters Applied */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {loading ? "Searching..." : `${properties.length} Properties Found`}
                        </h2>
                        {(searchFilters.location || searchFilters.propertyType || searchFilters.minPrice || searchFilters.maxPrice || selectedTags.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {searchFilters.location && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        📍 {searchFilters.location}
                                    </span>
                                )}
                                {searchFilters.propertyType && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        🏠 {searchFilters.propertyType}
                                    </span>
                                )}
                                {(searchFilters.minPrice || searchFilters.maxPrice) && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                        💰 {searchFilters.minPrice && `₹${searchFilters.minPrice}`}{searchFilters.minPrice && searchFilters.maxPrice && ' - '}{searchFilters.maxPrice && `₹${searchFilters.maxPrice}`}
                                    </span>
                                )}
                                {selectedTags.length > 0 && (
                                    <TagDisplay
                                        tags={selectedTags}
                                        type="feature"
                                        size="sm"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    {properties.length > 1 && (
                        <div className="flex gap-2">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sort by</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Filter Buttons */}
            {!loading && properties.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3">
                        <span className="text-sm font-medium text-gray-600">Quick Filters:</span>
                        <button
                            onClick={() => {
                                setSearchFilters(prev => ({ ...prev, maxPrice: '5000' }));
                                handleSearch();
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
                        >
                            Under ₹5,000
                        </button>
                        <button
                            onClick={() => {
                                setSearchFilters(prev => ({ ...prev, propertyType: 'apartment' }));
                                handleSearch();
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
                        >
                            Apartments Only
                        </button>
                    </div>
                </div>
            )}

            {/* Popular Tags Section */}
            {popularTags.length > 0 && (
                <PopularTags
                    tags={popularTags}
                    onTagClick={(tag) => {
                        setSelectedTags(prev =>
                            prev.includes(tag)
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                        );
                        handleSearch();
                    }}
                    selectedTags={selectedTags}
                />
            )}

            {loading && (
                <div className="text-center py-8">
                    <div className="text-gray-500">Searching properties...</div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <div
                        key={property._id}
                        className={`bg-white rounded-xl shadow overflow-hidden transition relative group ${property.isBooked
                            ? 'opacity-60 hover:opacity-75'
                            : 'hover:shadow-lg'
                            }`}
                    >
                        {/* Booked Tag */}
                        {property.isBooked && (
                            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Booked
                            </div>
                        )}

                        {/* Map View Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMapViewProperty(property);
                            }}
                            className="absolute top-3 right-3 z-10 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100"
                            title="View on Map"
                        >
                            <FaMap className="text-sm" />
                        </button>

                        <div
                            className="cursor-pointer"
                            onClick={() => navigate(`/listing/${property._id}`)}
                        >
                            <div className="relative h-56 w-full">
                                {property.images?.length > 0 ? (
                                    <div className="flex h-56 overflow-x-auto space-x-2 scroll-smooth scrollbar-hide">
                                        {property.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${property.title}-${idx}`}
                                                className="h-56 w-full object-cover rounded-xl"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="text-xl font-bold text-gray-800">
                                    ₹{property.price?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/night</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-700 mt-1">{property.title}</div>
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                    <FaMapMarkerAlt className="text-red-500 mr-1" />
                                    {property.location}
                                </div>

                                {/* Property Tags */}
                                {property.tags && property.tags.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <TagCount count={property.tags.length} size="sm" />
                                        </div>
                                        <TagDisplay
                                            tags={property.tags}
                                            limit={3}
                                            size="sm"
                                            type="outline"
                                        />
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const reviewStats = propertyReviews[property._id];
                                            const rating = reviewStats?.averageRating ||
                                                (3.5 + (parseInt(property._id?.slice(-1), 16) % 3) * 0.3);

                                            return (
                                                <FaStar
                                                    key={star}
                                                    className={`text-xs ${star <= Math.round(rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {(() => {
                                            const reviewStats = propertyReviews[property._id];
                                            const rating = reviewStats?.averageRating ||
                                                (3.5 + (parseInt(property._id?.slice(-1), 16) % 3) * 0.3);
                                            return rating.toFixed(1);
                                        })()}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({(() => {
                                            const reviewStats = propertyReviews[property._id];
                                            return reviewStats?.totalReviews ||
                                                (8 + (parseInt(property._id?.slice(-2), 16) % 25));
                                        })()} reviews)
                                    </span>
                                </div>


                                {property.isBooked && (
                                    <div className="mt-3 text-red-600 text-sm font-medium">
                                        Not available for selected dates
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {properties.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-6xl text-gray-300 mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                    <p className="text-gray-500 mb-6">
                        Try adjusting your search filters or explore different locations
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => {
                                setSearchFilters({ location: '', propertyType: '', minPrice: '', maxPrice: '' });
                                setSelectedTags([]);
                                fetchProperties();
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Clear All Filters
                        </button>
                        <button
                            onClick={() => {
                                setSearchFilters({ location: '', propertyType: '', minPrice: '', maxPrice: '' });
                                setSelectedTags([]);
                                navigate('/');
                            }}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}

            {/* Map View Modal */}
            {mapViewProperty && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-xl" />
                                    <div>
                                        <h2 className="text-2xl font-bold">{mapViewProperty.title}</h2>
                                        <p className="text-blue-100">{mapViewProperty.location}</p>
                                    </div>
                                </div>
                                <button
                                    className="text-white hover:text-red-300 text-2xl transition-colors"
                                    onClick={() => setMapViewProperty(null)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Property Info */}
                            <div className="mb-4 flex justify-between items-start">
                                <div>
                                    <div className="text-2xl font-bold text-green-600 mb-2">
                                        ₹{mapViewProperty.price?.toLocaleString()}/night
                                    </div>
                                    {mapViewProperty.tags?.length > 0 && (
                                        <TagDisplay
                                            tags={mapViewProperty.tags}
                                            limit={5}
                                            size="sm"
                                            type="outline"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setMapViewProperty(null);
                                        navigate(`/listing/${mapViewProperty._id}`);
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    View Details
                                </button>
                            </div>

                            {/* Map */}
                            <div className="h-96 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <MapContainer
                                    center={getCoordinatesFromLocation(mapViewProperty.location)}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker position={getCoordinatesFromLocation(mapViewProperty.location)}>
                                        <Popup>
                                            <div className="text-center p-2">
                                                <strong className="text-lg">{mapViewProperty.title}</strong>
                                                <br />
                                                <span className="text-gray-600">{mapViewProperty.location}</span>
                                                <br />
                                                <span className="text-green-600 font-bold text-lg">₹{mapViewProperty.price?.toLocaleString()}/night</span>
                                                <br />
                                                <div className="flex gap-1 flex-wrap justify-center mt-2">
                                                    {mapViewProperty.tags?.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    * Location is approximate and may not represent the exact address
                                </p>
                                <button
                                    onClick={() => {
                                        const coords = getCoordinatesFromLocation(mapViewProperty.location);
                                        window.open(`https://www.google.com/maps/@${coords[0]},${coords[1]},15z`, '_blank');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View on Google Maps →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;