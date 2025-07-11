import React, { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CiLock } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { RiFilter3Line } from "react-icons/ri";
import { FaHome, FaList, FaSearch, FaPhone, FaUserPlus, FaBars, FaTimes, FaSignInAlt, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { isAuthenticated } from './utils/AuthUtils';

const cities = [

];

const Navbar = () => {
    const location = useLocation();
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && menuOpen) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                const name = parsed.name || parsed.firstName || '';
                setFirstName(name.split(' ')[0]);
            } catch {
                setFirstName('');
            }
        } else {
            setFirstName('');
        }
    }, [location.pathname]); // Re-run when the route changes to update authentication state

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setFirstName('');
        navigate('/');
    };



    const navigate = useNavigate(); // Inside the component

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/listing?search=${encodeURIComponent(search.trim())}`);
        }
    };


    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center px-6 py-3 bg-white/60 backdrop-blur-lg rounded-b-[3rem] ">
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-[50%] border border-gray-600" />
                    <p className="roboto-slab text-2xl font-semibold">Boulevard</p>
                </div>

                {/* Medium screens: Search bar only */}
                <form
                    onSubmit={handleSearch}
                    className="hidden md:flex lg:hidden flex-1 items-center bg-white rounded-full shadow px-3 py-1 mx-8 min-w-[250px] max-w-[350px]"
                >
                    <input
                        type="text"
                        placeholder="Search city, landmark, or property"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 outline-none bg-transparent px-2 py-1 text-gray-700"
                    />
                    <button type="submit" className="text-green-700 font-bold px-2 hover:text-green-900">
                        🔍
                    </button>
                </form>

                {/* Large screens: All nav inline */}
                <div className="hidden lg:flex flex-1 items-center justify-center gap-3">
                    <form
                        onSubmit={handleSearch}
                        className="md:flex flex-1 items-center bg-white rounded-full shadow px-3 py-1 mx-8 min-w-[250px] max-w-[350px]"
                    >
                        <input
                            type="text"
                            placeholder="Search city, landmark, or property"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 outline-none bg-transparent px-2 py-1 text-gray-700"
                        />
                        <button type="submit" className="text-green-700 font-bold px-2 hover:text-green-900">
                            🔍
                        </button>
                    </form>
                    <Link to="/" className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/' ? 'font-bold' : ''}`}>Home</Link>
                    <div className="relative group">
                        <button className="flex items-center text-gray-600 hover:text-gray-900 roboto-slab focus:outline-none" tabIndex={0}>
                            Bookings
                            <svg className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow z-10 opacity-0 scale-y-75 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-300 origin-top">
                            <Link to="/bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Browse Properties
                            </Link>
                            {firstName && (
                                <>
                                    <Link to="/my-bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        My Bookings
                                    </Link>
                                    <Link to="/owner-bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        Manage Properties
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <Link to="/listing" className="text-gray-600 hover:text-gray-900 roboto-slab">Listings</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-gray-900 roboto-slab">Contact</Link>
                </div>

                {/* Right side: Auth/User */}
                <div className="flex items-center ml-auto gap-3">
                    <Link to="/createListing">
                        <button className="hidden lg:flex bg-rounded bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors duration-300 roboto-slab flex items-center gap-1 ml-2">
                            Add Listing
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                            </svg>
                        </button>
                    </Link>

                    {/* Show user and logout if logged in on desktop, else show login/register */}
                    {isAuthenticated() ? (
                        <div className="hidden md:flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-700">Hi, {firstName}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/login"
                                className={`text-gray-600 hover:text-gray-900 roboto-slab ${location.pathname === '/login' ? 'font-bold' : ''} flex items-center`}
                            >
                                <CiLock className="" size={22} color="#222" style={{ fontWeight: 'bold' }} />
                                Login
                            </Link>
                            <p>/</p>
                            <Link
                                to="/register"
                                className={`text-gray-600 hover:text-gray-900 roboto-slab ${location.pathname === '/register' ? 'font-bold' : ''}`}
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu toggle button */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                        <FaBars size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Side Navbar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[10000] transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Close button and header */}
                    <div className="flex items-center justify-between p-5 border-b">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-gray-300" />
                            <h3 className="text-xl font-semibold">Boulevard</h3>
                        </div>
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Mobile search */}
                    <div className="p-4 border-b">
                        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-gray-700"
                            />
                            <button type="submit" className="text-gray-600">
                                <FaSearch size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="py-2">
                            <Link
                                to="/"
                                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaHome size={20} />
                                <span>Home</span>
                            </Link>

                            <Link
                                to="/listing"
                                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/listing' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaList size={20} />
                                <span>Listings</span>
                            </Link>

                            <Link
                                to="/bookings"
                                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/bookings' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaSearch size={20} />
                                <span>Browse Properties</span>
                            </Link>

                            {firstName && (
                                <>
                                    <Link
                                        to="/my-bookings"
                                        className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/my-bookings' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <FaList size={20} />
                                        <span>My Bookings</span>
                                    </Link>

                                    <Link
                                        to="/owner-bookings"
                                        className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/owner-bookings' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <FaList size={20} />
                                        <span>Manage Properties</span>
                                    </Link>
                                </>
                            )}

                            <Link
                                to="/contact"
                                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/contact' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaPhone size={20} />
                                <span>Contact</span>
                            </Link>

                            <Link
                                to="/createListing"
                                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-100 ${location.pathname === '/createListing' ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaPlus size={20} />
                                <span>Add Listing</span>
                            </Link>
                        </div>
                    </div>

                    {/* Auth Section - Mobile */}
                    <div className="border-t p-4">
                        {isAuthenticated() ? (
                            <div className="space-y-3">
                                <div className="text-lg font-semibold text-gray-700">Hi, {firstName}</div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition"
                                >
                                    <FaSignOutAlt size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition"
                                >
                                    <FaSignInAlt size={18} />
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
                                >
                                    <FaUserPlus size={18} />
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )

}

export default Navbar