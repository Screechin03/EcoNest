import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkerAlt, FaDollarSign, FaImages, FaInfoCircle, FaCheckCircle, FaTags, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import TagDisplay from './components/TagDisplay';
import { validateTags, tagsArrayToString } from './utils/tagUtils';
import { API_URL } from './config';

const Listings = () => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        city: '',
        tags: '',
        ownerEmail: '',
        ownerPhone: '',
    });
    const [images, setImages] = useState([]); // array of files
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formValidation, setFormValidation] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    // Popular tags for suggestions
    const popularTags = [
        'Pet-friendly', 'Garden', 'Parking', 'Furnished', 'Near Metro',
        'Balcony', 'AC', 'WiFi', 'Kitchen', 'Laundry', 'Swimming Pool',
        'Gym', 'Security', '24/7 Power Backup', 'Water Filter',
        'Gated Community', 'Children\'s Play Area', 'Near Market',
        'Near Hospital', 'Elevator', 'CCTV', 'Fire Safety'
    ];

    // Price estimation based on common ranges
    const estimatePrice = (location) => {
        const locationLower = location.toLowerCase();
        if (locationLower.includes('mumbai') || locationLower.includes('delhi') || locationLower.includes('bangalore')) {
            return { min: 15000, max: 50000 };
        } else if (locationLower.includes('pune') || locationLower.includes('hyderabad') || locationLower.includes('chennai')) {
            return { min: 10000, max: 35000 };
        }
        return { min: 8000, max: 25000 };
    };

    // Fetch owner info from localStorage (assuming user info is stored as 'user')
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setForm(f => ({
                ...f,
                ownerEmail: user.email || '',
                ownerPhone: user.phone || '',
            }));
        }
    }, []);

    // Real-time validation
    const validateForm = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'Title is required';
        if (!form.price || form.price <= 0) errors.price = 'Valid price is required';
        if (!form.location.trim()) errors.location = 'Location is required';
        if (!form.city.trim()) errors.city = 'City is required';
        if (!form.description.trim()) errors.description = 'Description is required';
        if (images.length === 0) errors.images = 'At least one image is required';

        // Validate that at least one tag is provided
        const tagArray = getTagsArray();
        if (tagArray.length === 0) errors.tags = 'At least one property feature is required';

        setFormValidation(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Clear validation error for this field
        if (formValidation[name]) {
            setFormValidation(prev => ({ ...prev, [name]: '' }));
        }

        // Show price estimation for location
        if (name === 'location' && value.length > 2) {
            const estimation = estimatePrice(value);
            // You could show this estimation in the UI
        }
    };

    // Convert tags string to array and back for easier manipulation
    const getTagsArray = () => validateTags(form.tags);

    const handleTagClick = (tag) => {
        const currentTags = getTagsArray();
        // If tag already exists, remove it (toggle behavior)
        if (currentTags.includes(tag)) {
            const newTags = tagsArrayToString(currentTags.filter(t => t !== tag));
            setForm({ ...form, tags: newTags });
        } else {
            // Otherwise add it
            const newTags = tagsArrayToString([...currentTags, tag]);
            setForm({ ...form, tags: newTags });
        }
    };

    const handleFileChange = (e) => {
        setImages([...e.target.files]);
        // Clear image validation error
        if (formValidation.images) {
            setFormValidation(prev => ({ ...prev, images: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fill in all required fields correctly.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', parseInt(form.price, 10));
        formData.append('location', form.location);
        formData.append('city', form.city);
        formData.append('ownerEmail', form.ownerEmail);
        formData.append('ownerPhone', form.ownerPhone);

        // Process tags - filter out empty tags and ensure proper format
        const tagArray = validateTags(form.tags);

        // Add each valid tag to the form data
        tagArray.forEach(tag => formData.append('tags[]', tag));

        images.forEach(file => formData.append('images', file));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/listings`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create listing');
            } else {
                setSuccess('Listing created successfully! Redirecting...');
                setTimeout(() => navigate('/listing'), 2000);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 mt-16">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Create New Listing</h1>
                    <p className="text-gray-600 text-lg">List your property and connect with potential tenants worldwide</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {currentStep > step ? <FaCheckCircle /> : step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-16 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <FaCheckCircle className="text-green-600" />
                            <span className="text-green-800">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaHome className="text-green-600 text-xl" />
                                    <h2 className="text-2xl font-semibold text-gray-800">Property Details</h2>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Property Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Spacious 2BHK apartment near Metro Station"
                                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formValidation.title && (
                                        <p className="mt-1 text-sm text-red-600">{formValidation.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe your property, its features, nearby amenities..."
                                        rows={4}
                                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formValidation.description && (
                                        <p className="mt-1 text-sm text-red-600">{formValidation.description}</p>
                                    )}
                                </div>

                                {/* Price and Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ₹
                                            Monthly Rent *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="Enter amount"
                                            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.price ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {formValidation.price && (
                                            <p className="mt-1 text-sm text-red-600">{formValidation.price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaMapMarkerAlt className="inline mr-1" />
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Enter city name (e.g., Mumbai, Delhi)"
                                            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.city ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {formValidation.city && (
                                            <p className="mt-1 text-sm text-red-600">{formValidation.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="inline mr-1" />
                                        Location *
                                    </label>                                        <input
                                            type="text"
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            placeholder="Area, Landmark, Address"
                                            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.location ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formValidation.location && (
                                        <p className="mt-1 text-sm text-red-600">{formValidation.location}</p>
                                    )}
                                    {form.location.length > 2 && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                                <FaInfoCircle />
                                                <span>Estimated rent range for {form.location}:
                                                    ${estimatePrice(form.location).min.toLocaleString()} -
                                                    ${estimatePrice(form.location).max.toLocaleString()}/month
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Features & Tags */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaTags className="text-green-600 text-xl" />
                                    <h2 className="text-2xl font-semibold text-gray-800">Property Features</h2>
                                </div>

                                {/* Tags Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Property Features
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={form.tags}
                                        onChange={handleChange}
                                        placeholder="Enter features separated by commas"
                                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${formValidation.tags ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formValidation.tags && (
                                        <p className="mt-1 text-sm text-red-600">{formValidation.tags}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Example: Pet-friendly, Parking, Garden, AC, WiFi
                                    </p>

                                    {getTagsArray().length > 0 && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Features:
                                            </label>
                                            <TagDisplay
                                                tags={getTagsArray()}
                                                type="primary"
                                                size="sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Popular Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Popular Features (Click to add/remove)
                                    </label>
                                    <TagDisplay
                                        tags={popularTags}
                                        type="primary"
                                        size="md"
                                        clickable={true}
                                        onTagClick={handleTagClick}
                                        selectedTags={getTagsArray()}
                                    />
                                    <p className="mt-2 text-xs italic text-gray-500">
                                        Click on features to add or remove them from your property
                                    </p>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaUser className="text-green-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaEnvelope className="inline mr-1" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="ownerEmail"
                                                value={form.ownerEmail}
                                                readOnly
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaPhone className="inline mr-1" />
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                name="ownerPhone"
                                                value={form.ownerPhone}
                                                readOnly
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaImages className="text-green-600 text-xl" />
                                    <h2 className="text-2xl font-semibold text-gray-800">Property Images</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Images *
                                    </label>
                                    <div className={`border-2 border-dashed rounded-xl p-8 text-center ${formValidation.images ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                                        }`}>
                                        <FaImages className="text-4xl text-gray-400 mx-auto mb-4" />
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer text-green-600 hover:text-green-700 font-semibold"
                                        >
                                            Click to upload images
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Upload multiple high-quality images to attract more tenants
                                        </p>
                                    </div>
                                    {formValidation.images && (
                                        <p className="mt-1 text-sm text-red-600">{formValidation.images}</p>
                                    )}
                                </div>

                                {/* Image Preview */}
                                {images.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                                            Selected Images ({images.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {images.map((file, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`preview-${idx}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="text-red-600">⚠️</div>
                                    <span className="text-red-800">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className={`px-6 py-3 rounded-lg font-semibold transition ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            Creating Listing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle />
                                            Create Listing
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <FaInfoCircle />
                        Tips for a Great Listing
                    </h3>
                    <ul className="space-y-2 text-blue-700">
                        <li>• Use high-quality, well-lit photos showing different rooms</li>
                        <li>• Write a detailed description highlighting unique features</li>
                        <li>• Include nearby amenities like schools, hospitals, metro stations</li>
                        <li>• Set competitive pricing based on location and features</li>
                        <li>• Respond quickly to inquiries to build trust</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Listings;