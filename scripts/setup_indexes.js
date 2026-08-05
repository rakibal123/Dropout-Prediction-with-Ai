/**
 * Dropout Prediction System - Database Indexes Setup Script
 * Run this script with Node.js to manually enforce all indexes.
 * Usage: node scripts/setup_indexes.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dropout_db';

async function setupIndexes() {
    try {
        console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;

        console.log('Creating index for Users...');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });

        console.log('Creating index for BehaviorRecords...');
        await db.collection('behaviorrecords').createIndex({ studentId: 1 });
        await db.collection('behaviorrecords').createIndex({ createdAt: -1 });

        console.log('Creating index for PredictionHistory...');
        await db.collection('predictionhistories').createIndex({ studentId: 1 });
        await db.collection('predictionhistories').createIndex({ riskLevel: 1 });
        await db.collection('predictionhistories').createIndex({ predictionTimestamp: -1 });

        console.log('Creating index for Messages...');
        await db.collection('messages').createIndex({ senderId: 1 });
        await db.collection('messages').createIndex({ receiverId: 1 });
        await db.collection('messages').createIndex({ createdAt: -1 });

        console.log('Creating index for Notifications...');
        await db.collection('notifications').createIndex({ receiverId: 1 });
        await db.collection('notifications').createIndex({ isRead: 1 });
        await db.collection('notifications').createIndex({ createdAt: -1 });

        console.log('Creating index for Recommendations...');
        await db.collection('recommendations').createIndex({ studentId: 1 });
        await db.collection('recommendations').createIndex({ status: 1 });
        await db.collection('recommendations').createIndex({ riskLevel: 1 });
        await db.collection('recommendations').createIndex({ dueDate: 1 });

        console.log('All indexes created successfully!');
    } catch (error) {
        console.error('Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

setupIndexes();
