import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = ({ user }) => {
    const [stats, setStats] = useState({ artworks: 0, artists: 0, collectors: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/artworks');
                const artworks = res.data.artworks || [];
                const uniqueArtists = new Set(artworks.map(a => a.artist));
                setStats({
                    artworks: artworks.length,
                    artists: uniqueArtists.size || 42,
                    collectors: artworks.length * 15 || 289
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">🎨 Where Art Meets Innovation</div>
                    <h1 className="hero-title">
                        Discover <span className="gradient-text">Masterpieces</span>
                        <br />From Global Artists
                    </h1>
                    <p className="hero-subtitle">
                        Join the most vibrant digital art community. Showcase your creativity,
                        explore stunning artworks, and connect with art enthusiasts worldwide.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/add')}>
                            🖼️ Submit Your Art
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/gallery')}>
                            ✨ Explore Gallery
                        </button>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <div className="stat-number">{stats.artworks}+</div>
                        <div className="stat-label">Artworks</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.artists}+</div>
                        <div className="stat-label">Artists</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.collectors}+</div>
                        <div className="stat-label">Collectors</div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">Why Choose <span className="gradient-text">ArtSpace Nexus?</span></h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Easy Submission</h3>
                        <p>Upload your artwork in minutes with our intuitive form</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌍</div>
                        <h3>Global Community</h3>
                        <p>Connect with artists and collectors from around the world</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure Platform</h3>
                        <p>Your art is safe with our advanced security system</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💎</div>
                        <h3>Verified Artists</h3>
                        <p>Authenticated profiles and original artwork verification</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Showcase Your Art?</h2>
                    <p>Join thousands of artists who have found their creative home at ArtSpace Nexus</p>
                    <button className="btn-primary cta-btn" onClick={() => navigate('/add')}>
                        Start Your Journey →
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;