const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ CORRECT: Export as object with protect function
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'artspace_super_secret_key_2024');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized - Invalid token'
        });
    }
};

// ✅ CORRECT: Export as object
module.exports = { protect };