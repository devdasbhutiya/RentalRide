import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import { FiMenu, FiX, FiUser, FiLogOut, FiPlusCircle, FiList, FiCalendar } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🚗</span>
                    <span className="logo-text">RentRide</span>
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/browse" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Browse Vehicles
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/add-vehicle" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                <FiPlusCircle /> List Your Vehicle
                            </Link>
                            <Link to="/my-listings" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                <FiList /> My Listings
                            </Link>
                            <Link to="/my-bookings" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                <FiCalendar /> My Bookings
                            </Link>
                        </>
                    ) : null}
                </div>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <div className="profile-dropdown">
                            <button
                                className="profile-btn"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <FiUser />
                                <span>{user?.displayName || 'User'}</span>
                            </button>

                            {isProfileOpen && (
                                <div className="dropdown-menu">
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <FiUser /> Profile
                                    </Link>
                                    <button
                                        className="dropdown-item"
                                        onClick={handleSignOut}
                                    >
                                        <FiLogOut /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
