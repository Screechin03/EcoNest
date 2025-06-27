import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaUser, FaChild, FaArrowLeft, FaDoorOpen, FaBed, FaBath, FaRulerCombined, FaEnvelope, FaHome, FaComments, FaLeaf, FaWater, FaTrashAlt, FaSolarPanel, FaRecycle } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PaymentPage from './PaymentPage';
import TagDisplay from './components/TagDisplay';
import TagCount from './components/TagCount';
import ReviewsModal from './components/ReviewsModal';
import AddReviewForm from './components/AddReviewForm';
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

// --- Enhanced BookingBar with popover date range picker ---
const BookingBar = ({ rooms, setRooms }) => {
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

    // Helper to check if a date is selectable (not before today)
    const isDateDisabled = (date, startDate) => {
        if (date < today.setHours(0, 0, 0, 0)) return true;
        return false;
    };

    // Format date as "7 Apr"
    const formatShortDate = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

    return (
        <div className="w-full bg-white rounded-xl border border-indigo-200 flex flex-col gap-4 px-4 py-3 mb-8 shadow-sm">
            {rooms.map((room, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 w-full relative">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold mr-2">Select room for</span>
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
            <button
                className="mt-2 ml-auto text-indigo-600 hover:underline text-sm"
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
        </div>
    );
};
// --- End BookingBar ---

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Track rooms as an array
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const [rooms, setRooms] = useState([
        { adults: 1, children: 0, startDate: today, endDate: tomorrow }
    ]);
    const [property, setProperty] = useState(null);
    const [hostProperties, setHostProperties] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [amount, setAmount] = useState(0);
    const [bookingId, setBookingId] = useState(null);
    const [error, setError] = useState('');
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [reviewStats, setReviewStats] = useState(null);

    // Function to generate sustainability scores if not present
    const generateSustainabilityScores = (propertyData) => {
        if (propertyData.sustainability) return propertyData;

        // Generate scores between 60-95 for a positive bias
        const getRandomScore = () => Math.floor(Math.random() * 36) + 60;

        const enhancedProperty = {
            ...propertyData,
            sustainability: {
                energyEfficiency: getRandomScore(),
                waterConservation: getRandomScore(),
                wasteManagement: getRandomScore(),
                carbonFootprint: getRandomScore()
            }
        };

        return enhancedProperty;
    };

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`${API_URL}/listings/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch property');

                // Add sustainability scores if not present
                const propertyWithScores = generateSustainabilityScores(data.listing || data);
                setProperty(propertyWithScores);

                // Fetch other properties by the same host
                if ((data.listing || data).owner?._id) {
                    const hostRes = await fetch(`${API_URL}/listings/host/${(data.listing || data).owner._id}?excludePropertyId=${id}`);
                    const hostData = await hostRes.json();
                    if (hostRes.ok) {
                        setHostProperties(hostData);
                    }
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchUserBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(`${API_URL}/bookings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Filter bookings for this specific property
                    const propertyBookings = data.filter(booking => booking.listing?._id === id);
                    setUserBookings(propertyBookings);
                }
            } catch (err) {
                console.error('Error fetching user bookings:', err);
            }
        };

        const fetchReviewStats = async () => {
            try {
                const res = await fetch(`${API_URL}/reviews/listing/${id}?limit=1`);
                if (res.ok) {
                    const data = await res.json();
                    setReviewStats(data.stats);
                }
            } catch (err) {
                console.error('Error fetching review stats:', err);
            }
        };

        fetchProperty();
        fetchUserBookings();
        fetchReviewStats();
    }, [id]);

    // Calculate total nights and guests
    const calculateNights = (room) => {
        if (!room.startDate || !room.endDate) return 0;
        const start = new Date(room.startDate);
        const end = new Date(room.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };
    const totalGuests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);
    const totalNights = rooms.reduce((sum, r) => sum + calculateNights(r), 0);
    const totalAmount = rooms.reduce(
        (sum, r) => sum + calculateNights(r) * (property?.price || 0),
        0
    );

    const handleBooking = async (e) => {
        e.preventDefault();
        setError('');
        // Check for missing dates
        if (rooms.some(r => {
            const start = r.startDate ? new Date(r.startDate) : null;
            const end = r.endDate ? new Date(r.endDate) : null;
            return (
                !start ||
                !end ||
                isNaN(start.getTime()) ||
                isNaN(end.getTime()) ||
                calculateNights(r) <= 0
            );
        })) {
            setError('Please select valid dates for all rooms.');
            return;
        }
        setAmount(totalAmount);

        try {
            const token = localStorage.getItem('token');
            const orderRes = await fetch(`${API_URL}/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: totalAmount }),
            });
            const order = await orderRes.json();
            if (!orderRes.ok) throw new Error(order.error || 'Failed to create payment order');

            // Create separate bookings for each room since backend expects single date range per booking
            const bookingPromises = rooms.map(async (room) => {
                const start = new Date(room.startDate);
                const end = new Date(room.endDate);

                const bookingRes = await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        listing: property._id,
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        paymentOrderId: order.id,
                    }),
                });

                const booking = await bookingRes.json();
                if (!bookingRes.ok) throw new Error(booking.error || 'Failed to create booking');
                return booking;
            });

            const bookings = await Promise.all(bookingPromises);
            console.log('Booking responses:', bookings);

            // Store all booking IDs for reference (though we only need the first for payment)
            const allBookingIds = bookings.map(b => b.booking._id);
            console.log('All booking IDs created:', allBookingIds);

            // Use the first booking's ID for payment (they all share the same payment order)
            // The new confirm-payment-order endpoint will handle confirming all related bookings
            setBookingId(bookings[0].booking._id);
            setShowPayment(true);
        } catch (err) {
            setError(err.message);
        }
    };

    if (showPayment && bookingId) {
        return <PaymentPage bookingId={bookingId} amount={amount} />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-20 bg-white rounded-xl shadow p-8">
                <button onClick={() => navigate('/bookings')}>Back to Bookings</button>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="max-w-4xl mx-auto mt-20 bg-white rounded-xl shadow p-8">
                <button onClick={() => navigate('/bookings')}>Back to Bookings</button>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto mt-24 px-4 flex flex-col lg:flex-row justify-between gap-8 roboto-slab">
                <div className="flex-1">
                    {/* Booking Bar */}
                    <BookingBar rooms={rooms} setRooms={setRooms} />
                    {/* Image with Plot Name on Top */}
                    <div className="relative h-80 w-full mb-6">
                        {property.images?.length > 0 ? (
                            <div className="flex h-80 overflow-x-auto space-x-2 scroll-smooth scrollbar-hide">
                                {property.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`${property.title}-${idx}`}
                                        className="h-80 w-full object-cover rounded-xl"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">
                                No Image Available
                            </div>
                        )}
                        {/* Plot Name Overlay */}
                        <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/60 to-transparent px-6 py-4 flex items-center">
                            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">{property.title}</h1>
                        </div>
                        {/* Price Tag on Image (right end, parallel to facilities) */}
                        <div className="absolute top-6 right-6 z-20 flex items-center">
                            <span className="bg-green-700 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg flex items-center gap-1">
                                <svg className="w-5 h-5 text-white inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" />
                                </svg>
                                ₹{property.price}
                                <span className="text-base font-normal text-gray-200 ml-1">/ night</span>
                            </span>
                        </div>
                    </div>
                    {/* Facilities and Price Section */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-8">
                        {/* Facilities */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h2 className="text-xl font-bold">Facilities</h2>
                                {property.tags && property.tags.length > 0 && (
                                    <TagCount count={property.tags.length} />
                                )}
                            </div>
                            {property.tags && property.tags.length > 0 ? (
                                <div className="bg-white border border-gray-100 rounded-lg p-4">
                                    <TagDisplay
                                        tags={property.tags}
                                        type="feature"
                                        size="md"
                                    />
                                </div>
                            ) : (
                                <div className="flex gap-3 flex-wrap">
                                    <span className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">WiFi Available</span>
                                    <span className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">Clean & Sanitized</span>
                                    <span className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">24/7 Support</span>
                                    <span className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">Secure Booking</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location & Map Section */}
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-red-500">📍</span>
                            Location & Neighborhood
                        </h2>

                        <div className="mb-4">
                            <p className="text-gray-700 font-medium">{property.location}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Explore the area and nearby amenities
                            </p>
                        </div>

                        <div className="h-80 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                            <MapContainer
                                center={getCoordinatesFromLocation(property.location)}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={getCoordinatesFromLocation(property.location)}>
                                    <Popup>
                                        <div className="text-center p-2">
                                            <strong className="text-lg">{property.title}</strong>
                                            <br />
                                            <span className="text-gray-600">{property.location}</span>
                                            <br />
                                            <span className="text-green-600 font-bold text-lg">₹{property.price}/night</span>
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
                                    const coords = getCoordinatesFromLocation(property.location);
                                    window.open(`https://www.google.com/maps/@${coords[0]},${coords[1]},15z`, '_blank');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View on Google Maps →
                            </button>
                        </div>
                    </div>

                    {/* Description in a Box */}
                    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700">
                        {property.description}
                    </div>

                    {/* Sustainability Score Section */}
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FaLeaf className="text-green-500" />
                            Sustainability Score
                        </h2>

                        {/* Overall Score */}
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-green-500 mb-2">
                                <span className="text-3xl font-bold text-green-600">
                                    {property.sustainability ?
                                        Math.round((
                                            property.sustainability.energyEfficiency +
                                            property.sustainability.waterConservation +
                                            property.sustainability.wasteManagement +
                                            property.sustainability.carbonFootprint
                                        ) / 4) : 'N/A'}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm">Overall Eco-Rating</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Energy Efficiency */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Energy Efficiency</span>
                                    <div className="flex items-center gap-2">
                                        <FaSolarPanel className="text-yellow-500" />
                                        <span className="font-semibold text-lg">{property.sustainability?.energyEfficiency || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-yellow-500 h-2.5 rounded-full"
                                        style={{ width: `${property.sustainability?.energyEfficiency || 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Uses energy-efficient appliances and renewable energy sources like solar panels.</p>
                            </div>

                            {/* Water Conservation */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Water Conservation</span>
                                    <div className="flex items-center gap-2">
                                        <FaWater className="text-blue-500" />
                                        <span className="font-semibold text-lg">{property.sustainability?.waterConservation || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${property.sustainability?.waterConservation || 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Features water-saving fixtures, rainwater harvesting, and efficient irrigation systems.</p>
                            </div>

                            {/* Waste Management */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Waste Management</span>
                                    <div className="flex items-center gap-2">
                                        <FaRecycle className="text-green-600" />
                                        <span className="font-semibold text-lg">{property.sustainability?.wasteManagement || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${property.sustainability?.wasteManagement || 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Provides composting facilities and comprehensive recycling programs.</p>
                            </div>

                            {/* Carbon Footprint */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Carbon Footprint</span>
                                    <div className="flex items-center gap-2">
                                        <FaTrashAlt className="text-red-500" />
                                        <span className="font-semibold text-lg">{property.sustainability?.carbonFootprint || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-red-500 h-2.5 rounded-full"
                                        style={{ width: `${property.sustainability?.carbonFootprint || 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Measures the property's overall environmental impact and carbon emissions.</p>
                            </div>
                        </div>

                        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-700">
                            <p className="mb-1 font-medium text-green-700">Why This Matters:</p>
                            <p>Choosing eco-friendly accommodations reduces your travel carbon footprint and supports sustainable tourism. Properties with high sustainability scores contribute to environmental conservation efforts.</p>
                        </div>
                    </div>
                </div>

                {/* Extreme right: Summary Card */}
                <div className="w-full lg:w-96 flex-shrink-0 lg:ml-auto">
                    <div className="bg-white rounded-xl shadow p-6 mb-6">
                        <h3 className="text-lg font-bold mb-2">Summary</h3>
                        <div className="mb-2">
                            <span className="font-semibold">No. of Rooms:</span> {rooms.length}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Guests:</span> {totalGuests}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Total Nights:</span> {totalNights}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Total:</span> ₹{totalAmount}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Address:</span>
                            <div className="text-gray-600 break-words">
                                {property.location
                                    ? property.location
                                    : <span className="text-gray-400">No address provided.</span>
                                }
                            </div>
                        </div>
                        {/* Map placeholder */}
                        <div className="w-full h-48 bg-gray-200 rounded-lg mt-4 overflow-hidden border border-gray-300">
                            <MapContainer
                                center={getCoordinatesFromLocation(property.location)}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={getCoordinatesFromLocation(property.location)}>
                                    <Popup>
                                        <div className="text-center">
                                            <strong>{property.title}</strong>
                                            <br />
                                            <span className="text-sm text-gray-600">{property.location}</span>
                                            <br />
                                            <span className="text-green-600 font-semibold">₹{property.price}/night</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            * Approximate location based on area information
                        </p>
                        {/* Proceed to Payment Button */}
                        <form onSubmit={handleBooking} className="mt-6">
                            {error && <div className="text-red-500 mb-2">{error}</div>}
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                            >
                                Proceed to Payment
                            </button>
                        </form>

                        {/* Property Owner Information */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FaUser className="text-blue-600" />
                                Property Owner
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {property.owner?.name ? property.owner.name.charAt(0).toUpperCase() : 'O'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {property.owner?.name || 'Property Owner'}
                                        </p>
                                        <p className="text-sm text-gray-600">Verified Host</p>
                                    </div>
                                </div>

                                {property.owner?.email && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaEnvelope className="text-blue-600" />
                                        <a
                                            href={`mailto:${property.owner.email}`}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                        >
                                            {property.owner.email}
                                        </a>
                                    </div>
                                )}

                                {property.owner?.phone && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaPhone className="text-green-600" />
                                        <a
                                            href={`tel:${property.owner.phone}`}
                                            className="text-green-600 hover:text-green-800 transition"
                                        >
                                            {property.owner.phone}
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-gray-700">
                                    <FaCalendarAlt className="text-purple-600" />
                                    <span className="text-sm">
                                        Hosting since {new Date(property.owner?.createdAt || property.createdAt).getFullYear()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <FaHome className="text-orange-600" />
                                    <span className="text-sm">
                                        {hostProperties.length + 1} Properties Listed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Host's Other Properties */}
                        {hostProperties.length > 0 && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FaHome className="text-green-600" />
                                    More Properties by {property.owner?.name || 'This Host'}
                                </h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {hostProperties.slice(0, 3).map((hostProperty) => (
                                        <div
                                            key={hostProperty._id}
                                            onClick={() => navigate(`/listing/${hostProperty._id}`)}
                                            className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex gap-3">
                                                {hostProperty.images?.length > 0 && (
                                                    <img
                                                        src={hostProperty.images[0]}
                                                        alt={hostProperty.title}
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-grow min-w-0">
                                                    <h5 className="font-medium text-gray-800 truncate">
                                                        {hostProperty.title}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {hostProperty.location}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-sm font-bold text-green-600">
                                                            ₹{hostProperty.price?.toLocaleString()}/night
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {hostProperties.length > 3 && (
                                        <div className="text-center pt-2 border-t">
                                            <p className="text-sm text-gray-600 mb-2">
                                                +{hostProperties.length - 3} more properties by this host
                                            </p>
                                            <button
                                                onClick={() => {
                                                    // Navigate to bookings page with host filter (future enhancement)
                                                    navigate('/bookings');
                                                }}
                                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                            >
                                                View All Properties →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Add Review Form */}
                        <div className="mt-6">
                            <AddReviewForm
                                listingId={property._id}
                                userBookings={userBookings}
                                onReviewAdded={() => {
                                    // Refresh reviews section (could trigger a re-fetch)
                                    window.location.reload(); // Simple approach
                                }}
                            />
                        </div>

                        {/* See Reviews Button */}
                        <div className="mt-6">
                            <button
                                onClick={() => setShowReviewsModal(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium"
                            >
                                <FaComments className="text-lg" />
                                <span>
                                    {reviewStats ? (
                                        <>
                                            See All Reviews
                                            <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                                                {reviewStats.averageRating?.toFixed(1)} ★ ({reviewStats.totalReviews})
                                            </span>
                                        </>
                                    ) : (
                                        'See All Reviews'
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded transition"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>

            {/* Reviews Modal */}
            <ReviewsModal
                isOpen={showReviewsModal}
                onClose={() => setShowReviewsModal(false)}
                listingId={property._id}
                propertyTitle={property.title}
            />
        </>
    );
};

export default PropertyDetails;