const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    artwork: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);