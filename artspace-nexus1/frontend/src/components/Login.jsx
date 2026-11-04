import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ loginUser }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/auth/login', formData);
            loginUser(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>🎨 Welcome Back!</h2>
                <p className="auth-subtitle">Login to your ArtSpace Nexus account</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : '🚀 Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;