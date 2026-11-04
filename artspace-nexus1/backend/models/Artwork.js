const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    artist: {
        type: String,
        required: [true, 'Please add an artist name'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Please add a year'],
        min: [1000, 'Year must be greater than 1000'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Painting', 'Sculpture', 'Digital Art', 'Photography', 'Drawing', 'Mixed Media']
    },
    medium: {
        type: String,
        required: [true, 'Please select a medium'],
        enum: ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Charcoal', 'Clay', 'Bronze']
    },
    dimensions: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters'],
        default: ''
    },
    imageUrl: {
        type: String,
        required: [true, 'Please provide an image URL']
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Artwork', ArtworkSchema);