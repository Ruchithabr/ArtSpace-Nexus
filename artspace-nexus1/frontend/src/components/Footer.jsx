import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="nexus-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <div className="footer-logo">
                        <span className="logo-icon">🎭</span>
                        <div className="logo-text">
                            <span className="logo-main">ArtSpace</span>
                            <span className="logo-sub">Nexus</span>
                        </div>
                    </div>
                    <p className="footer-description">
                        Empowering artists worldwide to showcase their creativity and connect with art lovers.
                    </p>
                    <div className="social-icons">
                        <a href="#" className="social-icon">📘</a>
                        <a href="#" className="social-icon">📷</a>
                        <a href="#" className="social-icon">🎨</a>
                        <a href="#" className="social-icon">💬</a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/add">Add Artwork</a></li>
                        <li><a href="/gallery">Gallery</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#">Artist Tips</a></li>
                        <li><a href="#">Community Guidelines</a></li>
                        <li><a href="#">Help Center</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Newsletter</h4>
                    <p>Get art inspiration delivered to your inbox</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Your email address" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} ArtSpace Nexus. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;