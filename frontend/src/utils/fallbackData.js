/**
 * Utility module for providing fallback data when API calls fail
 */

// Popular cities fallback data
export const popularCitiesFallback = [
    { name: "Mumbai", count: 0, img: "/listing2.png", searchTerm: "mumbai" },
    { name: "Delhi", count: 0, img: "/listing3.png", searchTerm: "delhi" },
    { name: "Bangalore", count: 0, img: "/listing4.png", searchTerm: "bangalore" },
    { name: "Chennai", count: 0, img: "/listing5.png", searchTerm: "chennai" },
    { name: "Hyderabad", count: 0, img: "/listing6.png", searchTerm: "hyderabad" },
    { name: "Pune", count: 0, img: "/listing7.png", searchTerm: "pune" }
];

// Stats overview fallback data
export const statsOverviewFallback = {
    totalListings: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalCities: 0,
    featuredCities: [
        { name: "Mumbai", count: 0 },
        { name: "Delhi", count: 0 },
        { name: "Bangalore", count: 0 }
    ]
};

// Cities fallback data
export const citiesFallback = [
    { name: "Mumbai", count: 15, state: "Maharashtra", imageUrl: "/listing2.png" },
    { name: "Delhi", count: 12, state: "Delhi", imageUrl: "/listing3.png" },
    { name: "Bangalore", count: 10, state: "Karnataka", imageUrl: "/listing4.png" },
    { name: "Chennai", count: 8, state: "Tamil Nadu", imageUrl: "/listing5.png" },
    { name: "Hyderabad", count: 7, state: "Telangana", imageUrl: "/listing6.png" },
    { name: "Pune", count: 6, state: "Maharashtra", imageUrl: "/listing7.png" },
    { name: "Kolkata", count: 5, state: "West Bengal", imageUrl: "/listing8.png" },
    { name: "Ahmedabad", count: 4, state: "Gujarat", imageUrl: "/listing9.png" }
];

// Popular listings fallback
export const popularListingsFallback = [
    {
        _id: "fallback1",
        title: "Spacious 3BHK with Garden",
        price: 25000,
        location: "Mumbai, Maharashtra",
        images: ["/listing1.png"],
        tags: ["Garden", "3BHK", "Parking"]
    },
    {
        _id: "fallback2",
        title: "Modern 2BHK near Metro",
        price: 18000,
        location: "Delhi, Delhi",
        images: ["/listing2.png"],
        tags: ["2BHK", "Metro", "Security"]
    },
    {
        _id: "fallback3",
        title: "Luxury 4BHK Villa",
        price: 45000,
        location: "Bangalore, Karnataka",
        images: ["/listing3.png"],
        tags: ["4BHK", "Pool", "Garden"]
    }
];
