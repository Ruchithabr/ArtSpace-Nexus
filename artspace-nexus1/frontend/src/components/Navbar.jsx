import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logoutUser }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/', name: 'Home', icon: '🏠' },
        { path: '/add', name: 'Add Artwork', icon: '🖼️' },
        { path: '/gallery', name: 'Gallery', icon: '✨' },
    ];

    return (
        <nav className="nexus-navbar">
            <div className="nav-container">
                <div className="logo" onClick={() => navigate('/')}>
                    <div className="logo-icon">🎭</div>
                    <div className="logo-text">
                        <span className="logo-main">ArtSpace</span>
                        <span className="logo-sub">Nexus</span>
                    </div>
                </div>

                <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active-link' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span>{link.name}</span>
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className={`nav-link ${location.pathname === '/profile' ? 'active-link' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="nav-icon">👤</span>
                                <span>{user.name}</span>
                            </Link>
                            <button className="logout-btn" onClick={handleLogout}>
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active-link' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="nav-icon">🔐</span>
                                <span>Login</span>
                            </Link>
                            <Link
                                to="/register"
                                className={`nav-link ${location.pathname === '/register' ? 'active-link' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="nav-icon">📝</span>
                                <span>Register</span>
                            </Link>
                        </>
                    )}
                </div>

                <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;