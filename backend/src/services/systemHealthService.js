const mongoose = require('mongoose');
const os = require('os');
const axios = require('axios');
const User = require('../models/User');
const BehaviorRecord = require('../models/BehaviorRecord');
const PredictionHistory = require('../models/PredictionHistory');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Session = require('../models/Session');

const getSystemHealth = async () => {
    // 1. Check MongoDB Status
    const dbStatus = mongoose.connection.readyState === 1 ? 'Online' : 'Offline';
    
    // 2. Check FastAPI Status (mocking ping for robustness if service is down)
    let mlStatus = 'Offline';
    let mlResponseTime = 0;
    try {
        const mlStart = Date.now();
        // Assuming FastAPI has a health or root endpoint. If not, it will timeout/catch.
        await axios.get('http://localhost:8000/', { timeout: 1500 });
        mlResponseTime = Date.now() - mlStart;
        mlStatus = 'Online';
    } catch (error) {
        mlStatus = 'Offline';
    }

    // 3. Database Collection Counts
    const [
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalBehaviorRecords,
        totalPredictions,
        totalMessages,
        totalNotifications
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        User.countDocuments({ role: 'admin' }),
        BehaviorRecord.countDocuments(),
        PredictionHistory.countDocuments(),
        Message.countDocuments(),
        Notification.countDocuments()
    ]);

    // 4. Server Metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(1);
    
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / (3600*24));
    const hours = Math.floor(uptimeSeconds % (3600*24) / 3600);
    const serverUptime = `${days}d ${hours}h`;

    const cpuUsagePercent = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(1); // 1 min load average approx

    // 5. Active Users (Mocking based on sessions updated in last 24h, or we can use the Session model)
    const activeSessions = await Session.find().populate('userId', 'role');
    let studentsOnline = 0;
    let teachersOnline = 0;
    let adminsOnline = 0;

    activeSessions.forEach(session => {
        if (session.userId) {
            if (session.userId.role === 'student') studentsOnline++;
            if (session.userId.role === 'teacher') teachersOnline++;
            if (session.userId.role === 'admin') adminsOnline++;
        }
    });
    
    const todaysLogins = studentsOnline + teachersOnline + adminsOnline + Math.floor(Math.random() * 20); // Some mock history

    // 6. DB Size Mock (Mongoose doesn't have a simple method without running command)
    const dbSize = '14.2 MB'; // Mock for illustration

    // 7. API and ML Stats (Mocked daily stats for charts)
    const apiRequestsToday = Math.floor(Math.random() * 5000) + 1000;
    const avgResponseTime = Math.floor(Math.random() * 50) + 20; // 20-70ms
    
    const mlStats = {
        modelName: 'Random Forest v1.0',
        trainingDate: '2026-08-01',
        predictionCount: totalPredictions,
        avgPredictionTime: '35ms',
        accuracy: '96.2%'
    };

    // 8. Error Logs (Mocked recent errors removed for clarity)
    const systemLogs = [];

    return {
        status: {
            backend: 'Online',
            fastApi: mlStatus,
            database: dbStatus
        },
        performance: {
            apiRequestsToday,
            avgResponseTime: `${avgResponseTime}ms`,
            serverUptime,
            memoryUsage: `${memoryUsagePercent}%`,
            cpuUsage: `${cpuUsagePercent}%`,
            storageUsage: '45%'
        },
        mlStatus: mlStats,
        databaseInfo: {
            status: dbStatus,
            size: dbSize,
            collections: {
                students: totalStudents,
                teachers: totalTeachers,
                admins: totalAdmins,
                behaviorRecords: totalBehaviorRecords,
                predictions: totalPredictions,
                messages: totalMessages,
                notifications: totalNotifications
            }
        },
        activity: {
            todaysLogins,
            currentActiveUsers: studentsOnline + teachersOnline + adminsOnline,
            studentsOnline,
            teachersOnline,
            adminsOnline
        },
        logs: systemLogs,
        // Mock data for Recharts
        chartData: {
            responseTime: [
                { time: '00:00', ms: 25 }, { time: '04:00', ms: 22 }, { time: '08:00', ms: 45 },
                { time: '12:00', ms: 80 }, { time: '16:00', ms: 65 }, { time: '20:00', ms: 30 }
            ],
            predictions: [
                { day: 'Mon', count: 120, successRate: 98 }, { day: 'Tue', count: 150, successRate: 99 },
                { day: 'Wed', count: 180, successRate: 95 }, { day: 'Thu', count: 90, successRate: 100 },
                { day: 'Fri', count: 200, successRate: 97 }
            ],
            activeUsers: [
                { day: 'Mon', students: 400, teachers: 20 }, { day: 'Tue', students: 450, teachers: 22 },
                { day: 'Wed', students: 430, teachers: 21 }, { day: 'Thu', students: 480, teachers: 25 },
                { day: 'Fri', students: 500, teachers: 24 }
            ],
            globalFeatureImportance: [
                { feature: "Attendance", importance: 35 },
                { feature: "Submission Rate", importance: 25 },
                { feature: "Quiz Average", importance: 15 },
                { feature: "Study Hours", importance: 10 },
                { feature: "Stress Level", importance: 8 },
                { feature: "Engagement", importance: 7 }
            ]
        }
    };
};

module.exports = {
    getSystemHealth
};
