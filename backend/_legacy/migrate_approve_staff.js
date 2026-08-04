/**
 * One-time migration script.
 * Updates any teacher/admin accounts that have status='pending'
 * (created before the approval system was added) to status='approved'.
 */
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

async function migrate() {
    try {
        await connectDB();

        const result = await User.updateMany(
            { role: { $in: ['teacher', 'admin'] }, status: 'pending' },
            { $set: { status: 'approved', approved: true } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} teacher/admin account(s) to approved.`);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

migrate();
