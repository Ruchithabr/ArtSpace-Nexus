const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Artwork = require('../models/Artwork');
const Comment = require('../models/Comment');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// ============================================
// ✅ GET ALL ARTWORKS
// ============================================
router.get('/', async (req, res) => {
    try {
        const { category, sort } = req.query;
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        let artworks = await Artwork.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Optional sorting
        if (sort === 'popular') {
            artworks = artworks.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        } else if (sort === 'views') {
            artworks = artworks.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        res.status(200).json({
            success: true,
            count: artworks.length,
            artworks
        });
    } catch (error) {
        console.error('❌ Error fetching artworks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ GET SINGLE ARTWORK
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
            .populate('user', 'name email bio location');

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        // Increment views
        artwork.views = (artwork.views || 0) + 1;
        await artwork.save();

        // Get comments
        const comments = await Comment.find({ artwork: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            artwork,
            comments
        });
    } catch (error) {
        console.error('❌ Error fetching artwork:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ CREATE ARTWORK (WITH IMAGE UPLOAD)
// ============================================
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        console.log('📝 Creating artwork...');
        console.log('📝 Body:', req.body);
        console.log('📸 File:', req.file);

        // ✅ Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // ✅ Construct image URL
        const imageUrl = `/uploads/${req.file.filename}`;
        console.log('📸 Image URL:', imageUrl);

        // ✅ Extract form data
        const {
            title,
            artist,
            year,
            category,
            medium,
            dimensions,
            price,
            description
        } = req.body;

        // ✅ Validate required fields
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!artist) missingFields.push('artist');
        if (!year) missingFields.push('year');
        if (!category) missingFields.push('category');
        if (!medium) missingFields.push('medium');

        if (missingFields.length > 0) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // ✅ Create artwork
        const artwork = await Artwork.create({
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            category,
            medium,
            dimensions: dimensions || '',
            price: price || 0,
            description: description || '',
            imageUrl: imageUrl,
            user: req.user._id
        });

        console.log('✅ Artwork created:', artwork.title);
        console.log('✅ Image URL:', artwork.imageUrl);

        res.status(201).json({
            success: true,
            artwork
        });
    } catch (error) {
        console.error('❌ Create artwork error:', error);

        // Delete uploaded file if error occurs
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// ============================================
// ✅ UPDATE ARTWORK
// ============================================
router.put('/:id', protect, async (req, res) => {
    try {
        let artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        // Check ownership
        if (artwork.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this artwork'
            });
        }

        const { title, artist, year, category, medium, dimensions, price, description } = req.body;

        artwork.title = title || artwork.title;
        artwork.artist = artist || artwork.artist;
        artwork.year = year || artwork.year;
        artwork.category = category || artwork.category;
        artwork.medium = medium || artwork.medium;
        artwork.dimensions = dimensions || artwork.dimensions;
        artwork.price = price || artwork.price;
        artwork.description = description || artwork.description;

        await artwork.save();

        res.status(200).json({
            success: true,
            artwork
        });
    } catch (error) {
        console.error('❌ Update artwork error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ DELETE ARTWORK
// ============================================
router.delete('/:id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        // Check ownership
        if (artwork.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this artwork'
            });
        }

        // ✅ Delete image file from uploads folder
        const imagePath = path.join(__dirname, '../', artwork.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('✅ Image deleted:', artwork.imageUrl);
        }

        // Delete comments
        await Comment.deleteMany({ artwork: req.params.id });

        // Delete artwork
        await artwork.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Artwork deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete artwork error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ LIKE / UNLIKE ARTWORK
// ============================================
router.put('/:id/like', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        const userId = req.user._id;
        const likeIndex = artwork.likes ? artwork.likes.indexOf(userId) : -1;

        let liked = false;

        if (likeIndex === -1) {
            if (!artwork.likes) artwork.likes = [];
            artwork.likes.push(userId);
            liked = true;
        } else {
            artwork.likes.splice(likeIndex, 1);
        }

        await artwork.save();

        res.status(200).json({
            success: true,
            liked,
            likes: artwork.likes ? artwork.likes.length : 0
        });
    } catch (error) {
        console.error('❌ Like error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ SAVE / UNSAVE ARTWORK
// ============================================
router.put('/:id/save', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        const saveIndex = user.savedArtworks ? user.savedArtworks.indexOf(req.params.id) : -1;
        let saved = false;

        if (saveIndex === -1) {
            if (!user.savedArtworks) user.savedArtworks = [];
            user.savedArtworks.push(req.params.id);
            saved = true;
        } else {
            user.savedArtworks.splice(saveIndex, 1);
        }

        await user.save();

        res.status(200).json({
            success: true,
            saved,
            savedCount: user.savedArtworks ? user.savedArtworks.length : 0
        });
    } catch (error) {
        console.error('❌ Save error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ INCREMENT SHARE COUNT
// ============================================
router.put('/:id/share', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        artwork.shares = (artwork.shares || 0) + 1;
        await artwork.save();

        res.status(200).json({
            success: true,
            shares: artwork.shares
        });
    } catch (error) {
        console.error('❌ Share error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ INCREMENT DOWNLOAD COUNT
// ============================================
router.put('/:id/download', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        artwork.downloads = (artwork.downloads || 0) + 1;
        await artwork.save();

        res.status(200).json({
            success: true,
            downloads: artwork.downloads
        });
    } catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ GET ARTWORKS BY USER
// ============================================
router.get('/user/:userId', async (req, res) => {
    try {
        const artworks = await Artwork.find({ user: req.params.userId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: artworks.length,
            artworks
        });
    } catch (error) {
        console.error('❌ Error fetching user artworks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ GET FEATURED ARTWORKS
// ============================================
router.get('/featured/popular', async (req, res) => {
    try {
        const artworks = await Artwork.find()
            .populate('user', 'name email')
            .sort({ likes: -1, views: -1 })
            .limit(6);

        res.status(200).json({
            success: true,
            count: artworks.length,
            artworks
        });
    } catch (error) {
        console.error('❌ Error fetching featured:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// ✅ TEST UPLOAD ROUTE
// ============================================
router.post('/test-upload', protect, upload.single('image'), (req, res) => {
    try {
        console.log('📸 Test upload received');
        console.log('File:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('❌ Test upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;