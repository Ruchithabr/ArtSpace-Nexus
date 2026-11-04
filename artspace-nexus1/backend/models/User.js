const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    savedArtworks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ NO pre-save hook - hashing is done in routes/auth.js
// This prevents double hashing

// ✅ Password comparison method
UserSchema.methods.matchPassword = function (enteredPassword) {
    console.log('🔐 Comparing passwords...');
    console.log('Entered password:', enteredPassword);
    console.log('Stored hash:', this.password);

    const isMatch = bcrypt.compareSync(enteredPassword, this.password);
    console.log('✅ Password match:', isMatch);

    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);