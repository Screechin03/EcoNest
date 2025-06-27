import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from './config';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [animation, setAnimation] = useState(false);

    // Trigger animation on page load
    useEffect(() => {
        setAnimation(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Message sent successfully! We will get back to you soon.');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                toast.error(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            toast.error('Network error. Please try again later.');
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Testimonial quotes
    const quotes = [
        {
            text: "Boulevard helped me find the most peaceful retreat for my family vacation. Their customer support was outstanding!",
            author: "Sarah Johnson",
            location: "Mumbai"
        },
        {
            text: "As a property owner, Boulevard has made it incredibly easy to manage bookings and connect with travelers seeking authentic experiences.",
            author: "Rahul Mehta",
            location: "Jaipur"
        },
        {
            text: "The attention to detail and eco-friendly focus of the properties listed on Boulevard aligns perfectly with my values as a traveler.",
            author: "Priya Sharma",
            location: "Bangalore"
        }
    ];

    // FAQ items
    const faqItems = [
        {
            question: "How do I book a property?",
            answer: "Browse our listings, select your desired dates, and click the \"Book Now\" button. Follow the prompts to complete your reservation with secure payment options."
        },
        {
            question: "What is the cancellation policy?",
            answer: "Cancellation policies vary by property. You can find the specific policy for each listing on the property details page before booking."
        },
        {
            question: "How can I list my property on Boulevard?",
            answer: "Register as a host, click on \"Add Listing\" in your dashboard, and follow the step-by-step guide to create your listing with photos, amenities, and pricing."
        },
        {
            question: "Is Boulevard available internationally?",
            answer: "Currently, we focus on eco-friendly accommodations across India. We have plans to expand internationally in the coming year."
        },
        {
            question: "How do I contact customer support?",
            answer: "You can reach our customer support team through this contact form, via email at support@boulevard.com, or by phone at +91 22 4321 0987, 24/7."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    return (
        <div className="pt-28 pb-16 px-4 md:px-8 bg-neutral-50">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className={`text-center mb-12 transition-all duration-1000 ${animation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 roboto-slab">Get in Touch</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about booking, properties, or becoming a host? We're here to help make your stay extraordinary.
                    </p>
                </div>

                {/* Contact Section with Image */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-center">
                    <div className={`rounded-xl overflow-hidden shadow-lg transform transition duration-1000 ${animation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                        <img
                            src="/contact-hero.jpg"
                            alt="Eco-friendly accommodation"
                            className="w-full h-[500px] object-cover"
                            onError={(e) => { e.target.src = "/listing1.png"; e.target.onerror = null; }}
                        />
                    </div>

                    <div className={`transition-all duration-1000 delay-300 ${animation ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800 roboto-slab">Send Us a Message</h2>

                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    placeholder="Booking Inquiry"
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    placeholder="Tell us what you need help with..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-green-600 text-white font-medium rounded-lg transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-75 transform hover:scale-[1.02]"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className={`mb-16 transition-all duration-1000 delay-500 ${animation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-3xl font-semibold text-center mb-10 roboto-slab">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {quotes.map((quote, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#4CAF50" className="opacity-50">
                                        <path d="M11 9.275C11 13.076 8.609 15.962 4.937 16.81L4 14.652C6.131 14.109 7.525 12.957 7.922 11.252H5V6H11V9.275ZM21 9.275C21 13.076 18.609 15.962 14.937 16.81L14 14.652C16.131 14.109 17.525 12.957 17.922 11.252H15V6H21V9.275Z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 mb-6 italic">{quote.text}</p>
                                <div>
                                    <p className="font-semibold text-gray-900">{quote.author}</p>
                                    <p className="text-gray-500 text-sm">{quote.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Office Locations */}
                <div className={`mb-16 transition-all duration-1000 delay-700 ${animation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-3xl font-semibold text-center mb-10 roboto-slab">Our Offices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <img
                                src="/office-mumbai.jpg"
                                alt="Mumbai Office"
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.src = "/listing2.png"; e.target.onerror = null; }}
                            />
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2">Mumbai</h3>
                                <p className="text-gray-700 mb-4">Boulevard Towers, Level 12<br />Bandra Kurla Complex<br />Mumbai, 400051</p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Phone:</span> +91 22 4321 0987<br />
                                    <span className="font-semibold">Email:</span> mumbai@boulevard.com
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <img
                                src="/office-delhi.jpg"
                                alt="Delhi Office"
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.src = "/listing3.png"; e.target.onerror = null; }}
                            />
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2">Delhi</h3>
                                <p className="text-gray-700 mb-4">Eco Boulevard, 8th Floor<br />Connaught Place<br />New Delhi, 110001</p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Phone:</span> +91 11 2345 6789<br />
                                    <span className="font-semibold">Email:</span> delhi@boulevard.com
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <img
                                src="/office-bangalore.jpg"
                                alt="Bangalore Office"
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.src = "/listing4.png"; e.target.onerror = null; }}
                            />
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2">Bangalore</h3>
                                <p className="text-gray-700 mb-4">Green Valley Campus<br />Whitefield<br />Bangalore, 560066</p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Phone:</span> +91 80 4567 1234<br />
                                    <span className="font-semibold">Email:</span> bangalore@boulevard.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={`bg-white p-8 rounded-xl shadow-lg mb-16 transition-all duration-1000 delay-900 ${animation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-3xl font-semibold text-center mb-10 roboto-slab">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-300"
                                    onClick={() => toggleAccordion(index)}
                                >
                                    <h3 className="font-bold text-lg text-gray-800">{item.question}</h3>
                                    <svg
                                        className={`w-6 h-6 text-green-600 transform transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : 'rotate-0'}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ${activeAccordion === index ? 'max-h-40' : 'max-h-0'
                                        }`}
                                >
                                    <p className="p-4 bg-gray-50 text-gray-700">{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className={`bg-green-50 p-10 rounded-xl text-center transition-all duration-1000 delay-1000 ${animation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 roboto-slab">Ready to Experience Boulevard?</h2>
                    <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                        Discover unique eco-friendly stays and create unforgettable memories with Boulevard.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="/listing"
                            className="inline-block py-3 px-6 bg-green-600 text-white font-medium rounded-lg transition duration-300 hover:bg-green-700 transform hover:scale-105 hover:shadow-lg"
                        >
                            Browse Properties
                        </a>
                        <a
                            href="/register"
                            className="inline-block py-3 px-6 bg-white text-green-600 font-medium rounded-lg border border-green-600 transition duration-300 hover:bg-gray-50 transform hover:scale-105 hover:shadow-lg"
                        >
                            Become a Host
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
