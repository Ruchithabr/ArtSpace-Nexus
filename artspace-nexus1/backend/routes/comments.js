const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Artwork = require('../models/Artwork');

// Add comment
router.post('/', protect, async (req, res) => {
    try {
        const { text, artworkId } = req.body;

        if (!text || !artworkId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide text and artwork ID'
            });
        }

        const artwork = await Artwork.findById(artworkId);
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        const comment = await Comment.create({
            text,
            user: req.user._id,
            artwork: artworkId
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name');

        res.status(201).json({
            success: true,
            comment: populatedComment
        });
    } catch (error) {
        console.error('❌ Comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ✅ CORRECT: Export router directly
module.exports = router;