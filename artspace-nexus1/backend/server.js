const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const artworkRoutes = require('./routes/artworks');
const commentRoutes = require('./routes/comments');

// ============================================
// ✅ MIDDLEWARE
// ============================================

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CRITICAL FIX: Serve uploaded images statically
// Make sure the uploads folder exists in your backend directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Uploads path:', uploadsPath);

// Serve the uploads folder
app.use('/uploads', express.static(uploadsPath));

// ✅ Also serve a default image if nothing is found
app.use('/uploads', (req, res, next) => {
    // If file not found, send a placeholder
    if (!req.url || req.url === '/') {
        return res.status(404).json({
            error: 'No images found in uploads folder'
        });
    }
    next();
});

// ============================================
// ✅ ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/comments', commentRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// ✅ Test route to check uploads folder
app.get('/api/uploads-info', (req, res) => {
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');

    try {
        if (!fs.existsSync(uploadsDir)) {
            return res.json({
                exists: false,
                message: 'Uploads folder does not exist',
                path: uploadsDir
            });
        }

        const files = fs.readdirSync(uploadsDir);
        res.json({
            exists: true,
            path: uploadsDir,
            fileCount: files.length,
            files: files
        });
    } catch (error) {
        res.json({
            exists: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
}

console.log('📡 Connecting to MongoDB Atlas...');

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ MongoDB Atlas Connected Successfully!");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`📍 Test: http://localhost:${PORT}/api/test`);
            console.log(`📍 Uploads: http://localhost:${PORT}/uploads/`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    });