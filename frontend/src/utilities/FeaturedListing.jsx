import React from 'react'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'

const FeaturedListing = () => {
    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Property Investor",
            image: "/avatar1.png",
            rating: 5,
            text: "Boulevard helped me find the perfect sustainable investment property. Their platform is intuitive and their support team is exceptional."
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "First-time Buyer",
            image: "/avatar2.png",
            rating: 5,
            text: "As a first-time buyer, I was nervous about the process. Boulevard made everything smooth and transparent. Highly recommended!"
        },
        {
            id: 3,
            name: "Emma Davis",
            role: "Property Host",
            image: "/avatar3.png",
            rating: 5,
            text: "Managing my eco-friendly rentals has never been easier. The booking system is seamless and the analytics are incredibly helpful."
        }
    ];

    return (
        <div>
            <section className="w-full py-20 px-4 md:px-16 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Featured Testimonials
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hear from our satisfied customers who found their perfect sustainable homes through Boulevard
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Featured Image */}
                        <div className="relative">
                            <img
                                src="/feature.png"
                                alt="Featured Property"
                                className="w-full rounded-2xl shadow-xl object-cover h-96"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-2xl font-bold mb-2">Eco Villa Paradise</h3>
                                <p className="text-lg opacity-90">Starting from ₹299/night</p>
                                <div className="flex items-center mt-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={16} />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm">4.9 (127 reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Testimonials */}
                        <div className="space-y-8">
                            <div className="mb-8">
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    "Extraordinary performance and exceptional service"
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Our commitment to sustainable living and customer satisfaction has earned us the trust of thousands of property seekers and hosts worldwide.
                                </p>
                            </div>

                            {/* Testimonial Cards */}
                            {testimonials.map((testimonial) => (
                                <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <FaStar key={i} size={14} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                "{testimonial.text}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-500 mb-1">1,250+</div>
                                    <div className="text-sm text-gray-600">Happy Customers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-500 mb-1">4.9</div>
                                    <div className="text-sm text-gray-600">Average Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-500 mb-1">98%</div>
                                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default FeaturedListing
