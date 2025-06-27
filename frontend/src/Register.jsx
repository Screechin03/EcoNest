import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from './utils/AuthUtils'
import { API_URL } from './config'

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', currentAddress: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            console.log('Attempting registration with:', { email: form.email });
            
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(form),
                mode: 'cors',
                credentials: 'omit' // Don't include credentials for auth endpoints
            });
            
            const data = await response.json();
            console.log('Registration response status:', response.status);
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            console.log('Registration successful');
            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to home
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="relative pt-28 px-7">
            <div className="w-full rounded-3xl overflow-hidden mx-auto h-[95vh]">
                <img
                    src="/home3.png"
                    alt="Register Background"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute top-12 left-0 w-full h-full z-10 flex flex-col md:flex-row items-center justify-center px-4 md:px-16 py-16">
                <div className="flex-1 text-white max-w-xl mb-12 md:mb-0 md:mr-12">
                    <div className="text-4xl md:text-5xl font-bold tracking-wide mb-6">
                        Join Us!
                    </div>
                    <div className="text-lg md:text-xl mb-4 font-light">

                        Your Gateway to Hidden Getaways
                    </div>
                    <div className="text-lg md:text-xl mb-4 font-light">

                        Discover Unique Places, Create Unique Memories, and Explore Beyond the Ordinary.
                    </div>
                </div>
                <div className="flex-1 max-w-md w-full bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
                    <form onSubmit={handleSubmit}>
                        <label className="block text-gray-100 font-semibold mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            className="w-full mb-4 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <label className="block text-gray-100 font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="w-full mb-4 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <label className="block text-gray-100 font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="**********"
                            className="w-full mb-4 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <label className="block text-gray-100 font-semibold mb-2">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            className="w-full mb-4 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        {error && <div className="text-red-300 mb-4 text-center">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-lg transition mb-4"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                        </div>

                        <div className="text-center text-gray-100 mt-4">
                            Already have an account? <a href="/login" className="text-blue-300 hover:underline">Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register