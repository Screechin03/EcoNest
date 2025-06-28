import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { isAuthenticated } from './utils/AuthUtils'
import { API_URL } from './config'
import { fetchWithCORS } from './services/fetchWithCORS'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check for error params
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'auth_failed') {
            setError('Authentication failed. Please try again.');
        }
    }, [searchParams]);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            console.log('Attempting login with:', { email });

            // Use fetch directly for login to avoid credential issues
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                mode: 'cors',
                credentials: 'omit' // Don't include credentials for auth endpoints
            });

            const data = await response.json();
            console.log('Login response status:', response.status);

            if (!response.ok) {
                throw new Error(data.error || 'Invalid credentials');
            }

            if (!data.token) {
                throw new Error('No authentication token received');
            }

            console.log('Login successful');
            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect using React Router's navigate
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="relative pt-28 px-7">
            {/* Background Image */}
            <div className="w-full rounded-3xl overflow-hidden mx-auto h-[80vh]">
                <img
                    src="/login.png"
                    alt="Login Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Overlay */}
            <div className="absolute top-0 left-0 w-full h-full z-10 flex flex-col md:flex-row items-center justify-center px-4 md:px-16 py-16">
                {/* Left: Branding and Text */}
                <div className="flex-1 text-white max-w-xl mb-12 md:mb-0 md:mr-12">
                    <div className="text-4xl md:text-5xl font-bold tracking-wide mb-6">
                        <span className="inline-block mb-2">TR<span className="inline-block -rotate-12">A</span>VEL</span>
                        <br />
                        EXPLORE<br />HORIZONS
                    </div>
                    <div className="text-lg md:text-xl mb-4 font-light">
                        Where Your Dream Destinations<br />Become Reality.
                    </div>
                    <div className="text-base md:text-lg opacity-80">
                        Embark on a journey where every corner<br />of the world is within your reach.
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="flex-1 max-w-md w-full bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
                    <form onSubmit={handleSubmit}>
                        <label className="block text-gray-900 font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full mb-4 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        <label className="block text-gray-900 font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="**********"
                            className="w-full mb-2 px-4 py-3 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <div className="flex justify-end mb-4">
                            <a href="#" className="text-blue-700 text-sm hover:underline">Forgot password?</a>
                        </div>


                        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-lg transition mb-4"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'SIGN IN'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                        </div>
                    </form>
                    <div className="text-center text-gray-700 mt-4">
                        Are you new? <Link to="/register" className="text-blue-700 hover:underline">Create an Account</Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Login