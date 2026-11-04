import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddArtwork from './components/AddArtwork';
import Gallery from './components/Gallery';
import ArtworkDetail from './components/ArtworkDetail';
import Profile from './components/Profile';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import './index.css';

axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
    const [theme, setTheme] = useState('light');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const loginUser = (token, userData) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <Router>
            <div className="App">
                <Navbar user={user} logoutUser={logoutUser} />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/login" element={<Login loginUser={loginUser} />} />
                    <Route path="/register" element={<Register loginUser={loginUser} />} />
                    <Route path="/add" element={user ? <AddArtwork /> : <Navigate to="/login" />} />
                    <Route path="/gallery" element={<Gallery user={user} />} />
                    <Route path="/artwork/:id" element={<ArtworkDetail user={user} />} />
                    <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;