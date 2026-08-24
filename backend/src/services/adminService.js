const User = require('../models/User');
const BehaviorRecord = require('../models/BehaviorRecord');
const PredictionHistory = require('../models/PredictionHistory');
const SystemLog = require('../models/SystemLog');
const AppError = require('../utils/appError');

const getDashboardStats = async () => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingStudents = await User.countDocuments({ role: 'student', status: 'pending' });
    const approvedStudents = await User.countDocuments({ role: 'student', status: 'approved' });
    const rejectedStudents = await User.countDocuments({ role: 'student', status: 'rejected' });
    
    const highRisk = await PredictionHistory.countDocuments({ riskLevel: 'High' });
    const mediumRisk = await PredictionHistory.countDocuments({ riskLevel: 'Medium' });
    const lowRisk = await PredictionHistory.countDocuments({ riskLevel: 'Low' });
    
    const totalPredictions = await PredictionHistory.countDocuments();
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysAssessments = await BehaviorRecord.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Simplistic active users today logic (depends on lastLogin field)
    const activeUsersToday = await User.countDocuments({
        lastLogin: { $gte: startOfDay, $lte: endOfDay }
    });

    return {
        totalStudents,
        totalTeachers,
        totalAdmins,
        pendingStudents,
        approvedStudents,
        rejectedStudents,
        highRisk,
        mediumRisk,
        lowRisk,
        totalPredictions,
        todaysAssessments,
        activeUsersToday
    };
};

const getUsers = async (queryParams) => {
    const { role, department, semester, status, search, sort = 'newest', page = 1, limit = 20 } = queryParams;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (status) query.status = status;
    
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } }
        ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'alphabetical') sortObj = { fullName: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).select('-password').sort(sortObj).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    return {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    };
};

const getUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) throw new AppError('User not found', 404);
    
    const predictionHistory = await PredictionHistory.find({ studentId: id }).sort({ createdAt: -1 }).limit(5);
    const behaviorRecords = await BehaviorRecord.find({ studentId: id }).sort({ createdAt: -1 }).limit(5);

    return { user, predictionHistory, behaviorRecords };
};

const updateUser = async (id, updateData, adminId, ipAddress) => {
    if (updateData.status === 'approved' || updateData.status === 'active' || updateData.approved === true) {
        updateData.status = 'approved';
        updateData.approved = true;
    } else if (updateData.status === 'rejected' || updateData.status === 'pending' || updateData.status === 'inactive' || updateData.approved === false) {
        updateData.approved = false;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new AppError('User not found', 404);
    
    await SystemLog.create({
        userId: adminId,
        action: `Updated User ${user.email}`,
        ipAddress,
        details: JSON.stringify(updateData)
    });
    
    return user;
};

const getPendingStudents = async () => {
    const pendingStudents = await User.find({
        role: 'student',
        status: 'pending'
    }).select('-password').sort({ createdAt: -1 });

    return pendingStudents;
};

const deleteUser = async (id, adminId, ipAddress) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError('User not found', 404);
    
    await SystemLog.create({
        userId: adminId,
        action: `Deleted User ${user.email}`,
        ipAddress
    });
    
    return null;
};

const getAnalytics = async () => {
    // 1. Student Risk Distribution
    const riskDistribution = [
        { name: 'Low', value: await PredictionHistory.countDocuments({ riskLevel: 'Low' }), color: '#10b981' },
        { name: 'Medium', value: await PredictionHistory.countDocuments({ riskLevel: 'Medium' }), color: '#f59e0b' },
        { name: 'High', value: await PredictionHistory.countDocuments({ riskLevel: 'High' }), color: '#ef4444' }
    ];
    
    // 2. Department-wise Risk Analysis
    const deptRiskRaw = await PredictionHistory.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: '$student' },
        {
            $group: {
                _id: { dept: '$student.department', risk: '$riskLevel' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Format department risk data
    const deptMap = {};
    deptRiskRaw.forEach(item => {
        const dept = item._id.dept || 'Unknown';
        const risk = item._id.risk;
        if (!deptMap[dept]) deptMap[dept] = { department: dept, Low: 0, Medium: 0, High: 0 };
        deptMap[dept][risk] = item.count;
    });
    const departmentRisk = Object.values(deptMap);

    // 3. Monthly Assessment Trend
    const monthlyAssessments = await PredictionHistory.aggregate([
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
    ]);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrend = monthNames.map((month, i) => {
        const found = monthlyAssessments.find(m => m._id === i + 1);
        return { month, assessments: found ? found.count : 0 };
    });

    // 4. Student Registration Trend
    const registrationAgg = await User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
    ]);
    const registrationTrend = monthNames.map((month, i) => {
        const found = registrationAgg.find(m => m._id === i + 1);
        return { month, students: found ? found.count : 0 };
    });

    // 5. Prediction Accuracy Trend (Mocked for future ML)
    const accuracyTrend = monthNames.map(month => ({
        month,
        accuracy: Math.floor(Math.random() * (99 - 92 + 1) + 92) // 92-99% mock
    }));

    // 6. Department Performance Comparison (Using finalScore)
    const deptPerfRaw = await PredictionHistory.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: '$student' },
        {
            $group: {
                _id: '$student.department',
                avgScore: { $avg: '$finalScore' }
            }
        }
    ]);
    const departmentPerformance = deptPerfRaw.map(d => ({
        department: d._id || 'Unknown',
        score: Math.round(d.avgScore)
    }));

    return {
        riskDistribution,
        departmentRisk,
        monthlyTrend,
        registrationTrend,
        accuracyTrend,
        departmentPerformance
    };
};

const getSystemLogs = async (queryParams) => {
    const { page = 1, limit = 50 } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await SystemLog.find().populate('userId', 'fullName email role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await SystemLog.countDocuments();
    
    return {
        logs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    };
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserById,
    getPendingStudents,
    updateUser,
    deleteUser,
    getAnalytics,
    getSystemLogs
};
