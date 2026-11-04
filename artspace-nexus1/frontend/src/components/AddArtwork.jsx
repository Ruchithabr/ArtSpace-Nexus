import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddArtwork.css';

const AddArtwork = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        year: '',
        category: '',
        medium: '',
        dimensions: '',
        price: '',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const categories = ['Painting', 'Sculpture', 'Digital Art', 'Photography', 'Drawing', 'Mixed Media'];
    const mediums = ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Charcoal', 'Clay', 'Bronze'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors({ ...errors, image: 'Please upload a valid image (JPEG, PNG, GIF, WEBP)' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: 'Image size must be less than 5MB' });
                return;
            }
            setImage(file);
            setErrors({ ...errors, image: '' });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        const currentYear = new Date().getFullYear();

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.artist.trim()) newErrors.artist = 'Artist name is required';
        if (!formData.year) {
            newErrors.year = 'Year is required';
        } else if (parseInt(formData.year) < 1000 || parseInt(formData.year) > currentYear) {
            newErrors.year = `Year must be between 1000 and ${currentYear}`;
        }
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.medium) newErrors.medium = 'Medium is required';
        if (!image) newErrors.image = 'Please upload an image';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });
        formDataToSend.append('image', image);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/artworks', formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            setLoading(false);
            setFormData({
                title: '',
                artist: '',
                year: '',
                category: '',
                medium: '',
                dimensions: '',
                price: '',
                description: ''
            });
            setImage(null);
            setImagePreview('');
            setTimeout(() => navigate('/gallery'), 2000);
        } catch (error) {
            console.error('Error creating artwork:', error);
            setLoading(false);
            alert(error.response?.data?.message || 'Failed to create artwork');
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview('');
    };

    return (
        <div className="add-artwork-container">
            <div className="add-artwork-header">
                <h1>🖼️ Add New Masterpiece</h1>
                <p>Share your creativity with the world</p>
            </div>

            <div className="form-wrapper">
                {success && (
                    <div className="success-alert">✅ Artwork created successfully! Redirecting...</div>
                )}

                <form onSubmit={handleSubmit} className="artwork-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Title <span className="required">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={errors.title ? 'error' : ''}
                                placeholder="e.g., Starry Night"
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label>Artist <span className="required">*</span></label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleChange}
                                className={errors.artist ? 'error' : ''}
                                placeholder="e.g., Vincent van Gogh"
                            />
                            {errors.artist && <span className="error-message">{errors.artist}</span>}
                        </div>

                        <div className="form-group">
                            <label>Year <span className="required">*</span></label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className={errors.year ? 'error' : ''}
                                placeholder="e.g., 1889"
                            />
                            {errors.year && <span className="error-message">{errors.year}</span>}
                        </div>

                        <div className="form-group">
                            <label>Category <span className="required">*</span></label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={errors.category ? 'error' : ''}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label>Medium <span className="required">*</span></label>
                            <select
                                name="medium"
                                value={formData.medium}
                                onChange={handleChange}
                                className={errors.medium ? 'error' : ''}
                            >
                                <option value="">Select Medium</option>
                                {mediums.map(med => (
                                    <option key={med} value={med}>{med}</option>
                                ))}
                            </select>
                            {errors.medium && <span className="error-message">{errors.medium}</span>}
                        </div>

                        <div className="form-group">
                            <label>Dimensions</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="e.g., 24 x 36 inches"
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (USD)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g., 2500"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Image <span className="required">*</span></label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                                    onChange={handleImageChange}
                                    className="file-input"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="file-label">
                                    <span className="upload-icon">📤</span>
                                    <span className="upload-text">Click to upload or drag and drop</span>
                                    <span className="file-types">JPEG, PNG, GIF, WEBP (Max 5MB)</span>
                                </label>
                            </div>
                            {errors.image && <span className="error-message">{errors.image}</span>}

                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button type="button" className="remove-image" onClick={handleRemoveImage}>
                                        ✖ Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe your artwork, inspiration, and story..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : '✨ Submit Artwork'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArtwork;