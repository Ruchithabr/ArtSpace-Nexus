const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ✅ REGISTER - hashes password manually
router.post('/register', async (req, res) => {
    try {
        console.log('\n📝 Registration attempt:', req.body.email);

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // ✅ HASH PASSWORD HERE
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        console.log('✅ Password hashed:', hashedPassword.substring(0, 20) + '...');

        // Create user with hashed password
        const user = new User({
            name,
            email,
            password: hashedPassword  // ← Store the hash, not plain text
        });

        await user.save();
        console.log('✅ User registered:', email);

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'artspace_super_secret_key_2024',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// ✅ LOGIN - compares password correctly
router.post('/login', async (req, res) => {
    try {
        console.log('\n🔐 Login attempt:', req.body.email);

        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Normalize email and password
        email = email.toLowerCase().trim();
        password = password.trim();

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ User found:', user.email);
        console.log('Stored hash:', user.password);

        // ✅ Use the matchPassword method
        const isMatch = user.matchPassword(password);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'artspace_super_secret_key_2024',
            { expiresIn: '30d' }
        );

        console.log('✅ Login successful:', email);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;