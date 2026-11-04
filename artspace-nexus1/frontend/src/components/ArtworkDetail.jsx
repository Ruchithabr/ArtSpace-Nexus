import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ArtworkDetail.css';

const ArtworkDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        fetchArtwork();
    }, [id]);

    const fetchArtwork = async () => {
        try {
            const res = await axios.get(`/artworks/${id}`);
            console.log('📸 Artwork data:', res.data.artwork);
            setArtwork(res.data.artwork);
            setComments(res.data.comments || []);
            setLikeCount(res.data.artwork.likes?.length || 0);
            if (user && res.data.artwork.likes) {
                setIsLiked(res.data.artwork.likes.includes(user.id));
            }
        } catch (error) {
            console.error('Error fetching artwork:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return 'https://via.placeholder.com/800x600?text=No+Image';
        }
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:5000${imageUrl}`;
        }
        return `http://localhost:5000/uploads/${imageUrl}`;
    };

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like artworks');
            navigate('/login');
            return;
        }
        try {
            const res = await axios.put(`/artworks/${id}/like`);
            setIsLiked(res.data.liked);
            setLikeCount(res.data.likes);
        } catch (error) {
            console.error('Error liking artwork:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to comment');
            navigate('/login');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await axios.post('/comments', {
                text: newComment,
                artworkId: id
            });
            setComments([res.data.comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (!artwork) return <div className="loading-container">Artwork not found</div>;

    const imageUrl = getImageUrl(artwork.imageUrl);

    return (
        <div className="artwork-detail-container">
            <div className="artwork-detail-grid">
                {/* ✅ Image Section */}
                <div className="artwork-image-section">
                    <div className={`image-wrapper ${isZoomed ? 'zoomed' : ''}`} onClick={handleZoom}>
                        <img
                            src={imageUrl}
                            alt={artwork.title}
                            className="artwork-detail-image"
                            onError={(e) => {
                                console.error('❌ Image failed to load:', imageUrl);
                                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                            }}
                            onLoad={() => console.log('✅ Image loaded:', imageUrl)}
                        />
                        <div className="image-zoom-hint">
                            <span>🔍 Click to {isZoomed ? 'zoom out' : 'zoom in'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="artwork-details-section">
                    <h1 className="artwork-title">{artwork.title}</h1>
                    <p className="artwork-artist">by {artwork.artist}</p>

                    <div className="artwork-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">📅 Year</span>
                            <span className="meta-value">{artwork.year}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">🎨 Category</span>
                            <span className="meta-value">{artwork.category}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">🖌️ Medium</span>
                            <span className="meta-value">{artwork.medium}</span>
                        </div>
                        {artwork.dimensions && (
                            <div className="meta-item">
                                <span className="meta-label">📏 Dimensions</span>
                                <span className="meta-value">{artwork.dimensions}</span>
                            </div>
                        )}
                        {artwork.price > 0 && (
                            <div className="meta-item">
                                <span className="meta-label">💰 Price</span>
                                <span className="meta-value">${artwork.price}</span>
                            </div>
                        )}
                    </div>

                    {artwork.description && (
                        <div className="artwork-description">
                            <h3>📝 Description</h3>
                            <p>{artwork.description}</p>
                        </div>
                    )}

                    <div className="artwork-stats">
                        <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                            ❤️ {likeCount}
                        </button>
                        <span className="stat-item">👁️ {artwork.views || 0}</span>
                        <span className="stat-item">📤 {artwork.shares || 0}</span>
                        <span className="stat-item">⬇️ {artwork.downloads || 0}</span>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3>💬 Comments ({comments.length})</h3>
                        {user ? (
                            <form onSubmit={handleComment} className="comment-form">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="comment-input"
                                />
                                <button type="submit" className="comment-btn">Post</button>
                            </form>
                        ) : (
                            <p className="login-to-comment">Login to leave a comment</p>
                        )}
                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-avatar">👤</div>
                                    <div className="comment-content">
                                        <p className="comment-user">{comment.user?.name || 'Anonymous'}</p>
                                        <p className="comment-text">{comment.text}</p>
                                        <p className="comment-date">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetail;