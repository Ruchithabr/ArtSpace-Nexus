const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const resetDB = async () => {
    try {
        // ✅ Use the same connection string as server.js
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error('❌ MONGO_URI is not defined in .env');
            process.exit(1);
        }

        console.log('📡 Connecting to MongoDB...');
        console.log('📡 Using URI:', mongoURI.replace(/\/\/.*@/, '//<credentials>@'));

        // Connect with IPv4 family to avoid DNS issues
        await mongoose.connect(mongoURI, {
            family: 4
        });

        console.log('✅ Connected to MongoDB');

        // Delete ALL users
        const result = await mongoose.connection.db.collection('users').deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users`);

        // Also delete artworks if you want a clean slate
        const artworkResult = await mongoose.connection.db.collection('artworks').deleteMany({});
        console.log(`✅ Deleted ${artworkResult.deletedCount} artworks`);

        await mongoose.disconnect();
        console.log('✅ Database reset complete!');
        console.log('📌 Now register a new user');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n📌 Troubleshooting:');
        console.log('1️⃣ Make sure MONGO_URI in .env is correct');
        console.log('2️⃣ Check if your IP is whitelisted in Atlas');
        console.log('3️⃣ Try using the direct connection string (mongodb:// instead of mongodb+srv://)');
        process.exit(1);
    }
};

resetDB();