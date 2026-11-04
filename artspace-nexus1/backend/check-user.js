const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        const user = await User.findOne({ email: 'keerthanadk28@gmail.com' });

        if (user) {
            console.log('✅ User found!');
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Password hash:', user.password);
            console.log('Password length:', user.password.length);
        } else {
            console.log('❌ User not found!');
        }

        // List all users
        const allUsers = await User.find({});
        console.log('\n📋 All users in database:', allUsers.length);
        allUsers.forEach(u => {
            console.log('  -', u.email, '(hashed password:', u.password ? 'Yes' : 'No');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

checkUser();