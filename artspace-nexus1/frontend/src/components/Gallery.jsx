import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';

const Gallery = ({ user }) => {
    const [artworks, setArtworks] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            const res = await axios.get('/artworks');
            console.log('📸 Artworks data:', res.data.artworks);
            setArtworks(res.data.artworks);
            setFilteredArtworks(res.data.artworks);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = artworks;
        if (searchTerm) {
            filtered = filtered.filter(art =>
                art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                art.artist.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(art => art.category === selectedCategory);
        }
        setFilteredArtworks(filtered);
    }, [searchTerm, selectedCategory, artworks]);

    const handleLike = async (id) => {
        if (!user) {
            alert('Please login to like artworks');
            return;
        }
        try {
            const res = await axios.put(`/artworks/${id}/like`);
            setArtworks(prev =>
                prev.map(art =>
                    art._id === id ? { ...art, likes: res.data.likes } : art
                )
            );
        } catch (error) {
            console.error('Error liking artwork:', error);
        }
    };

    const categories = ['all', 'Painting', 'Sculpture', 'Digital Art', 'Photography', 'Drawing', 'Mixed Media'];

    // ✅ CRITICAL: Function to get full image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return 'https://via.placeholder.com/400x300?text=No+Image';
        }

        // If it's already a full URL, return it
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // If it starts with /uploads, prepend the base URL
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:5000${imageUrl}`;
        }

        // If it's just a filename, construct the full path
        return `http://localhost:5000/uploads/${imageUrl}`;
    };

    if (loading) return <div className="loading-container">Loading artworks...</div>;

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>🎨 Art Gallery</h1>
                <p>Explore stunning artworks from talented artists worldwide</p>
            </div>

            <div className="gallery-controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by title or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filter-section">
                    <div className="filter-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat === 'all' ? 'All Artworks' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            ⊞ Grid
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ≡ List
                        </button>
                    </div>
                </div>
            </div>

            {filteredArtworks.length === 0 ? (
                <div className="no-results">
                    <p>No artworks found. Be the first to upload!</p>
                    <Link to="/add" className="upload-link">➕ Upload Artwork</Link>
                </div>
            ) : (
                <div className={`artworks-grid ${viewMode}`}>
                    {filteredArtworks.map((art) => {
                        const imageUrl = getImageUrl(art.imageUrl);
                        console.log(`🖼️ Loading image for ${art.title}: ${imageUrl}`);

                        return (
                            <div key={art._id} className="artwork-card">
                                <div className="artwork-image-container">
                                    <img
                                        src={imageUrl}
                                        alt={art.title}
                                        className="artwork-image"
                                        onError={(e) => {
                                            console.error('❌ Image failed to load:', imageUrl);
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                    />
                                    <div className="artwork-overlay">
                                        <Link to={`/artwork/${art._id}`} className="view-details-btn">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                                <div className="artwork-details">
                                    <h3>{art.title}</h3>
                                    <p className="artist">by {art.artist}</p>
                                    <div className="artwork-meta">
                                        <span className="category">{art.category}</span>
                                        <span className="year">{art.year}</span>
                                    </div>
                                    <div className="artwork-actions">
                                        <button className="like-btn" onClick={() => handleLike(art._id)}>
                                            ❤️ {art.likes?.length || 0}
                                        </button>
                                        <Link to={`/artwork/${art._id}`} className="view-btn">View</Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Gallery;