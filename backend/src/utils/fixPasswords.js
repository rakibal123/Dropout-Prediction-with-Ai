const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to', process.env.MONGO_URI.split('@')[1] || process.env.MONGO_URI);

        const emailsToFix = [
            'ozifa@university.edu',
            'rownok@university.edu',
            'setu@university.edu',
            'studentA@university.edu'
        ];

        for (const email of emailsToFix) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = 'password123';
                await user.save();
                console.log(`Reset password for ${email}`);
            }
        }

        console.log('Finished fixing passwords.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixPasswords();
