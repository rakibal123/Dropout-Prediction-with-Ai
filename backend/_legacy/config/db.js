const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dropout_risk';
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully ✅');
    } catch (err) {
        console.error('MongoDB Connection Failed ❌', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
