const User = require('../models/User');
const BehaviorRecord = require('../models/BehaviorRecord');
const PredictionHistory = require('../models/PredictionHistory');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

const getStudentTimeline = async (studentId, page = 1, limit = 20) => {
    let events = [];

    // 1. User Events
    const user = await User.findById(studentId);
    if (!user) throw new AppError('User not found', 404);
    
    events.push({
        id: `acc_created_${user._id}`,
        type: 'Account',
        title: 'Account Created',
        description: 'Your student account was created in the system.',
        timestamp: user.createdAt,
        category: 'Account',
        priority: 'Low',
        referenceId: user._id,
        data: {}
    });

    if (user.approved) {
        events.push({
            id: `acc_approved_${user._id}`,
            type: 'Account',
            title: 'Account Approved',
            description: 'Your account was officially approved by administration.',
            timestamp: user.updatedAt,
            category: 'Account',
            priority: 'Medium',
            referenceId: user._id,
            data: {}
        });
    }

    if (user.lastPasswordChange) {
        events.push({
            id: `pwd_changed_${user._id}`,
            type: 'Security',
            title: 'Password Changed',
            description: 'Your account password was updated.',
            timestamp: user.lastPasswordChange,
            category: 'Security',
            priority: 'High',
            referenceId: user._id,
            data: {}
        });
    }

    // 2. Behavior Records (Assessments)
    const behaviors = await BehaviorRecord.find({ studentId }).lean();
    behaviors.forEach(b => {
        events.push({
            id: `beh_${b._id}`,
            type: 'Assessment',
            title: 'Behavior Assessment Submitted',
            description: `You submitted an assessment. Score: ${b.engagementScore || 'N/A'}/100`,
            timestamp: b.createdAt,
            category: 'Assessment',
            priority: 'Medium',
            referenceId: b._id,
            data: b
        });
    });

    // 3. Prediction History
    const predictions = await PredictionHistory.find({ studentId }).lean();
    let previousRisk = null;
    predictions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(p => {
        
        let riskChangeTitle = 'Machine Learning Prediction Generated';
        let riskPriority = 'Medium';
        let riskStatus = 'Risk Stable';

        const currentRisk = p.riskLevel || (p.prediction ? p.prediction.riskLevel : null);

        if (previousRisk) {
            const levels = { 'Low': 1, 'Medium': 2, 'High': 3 };
            const prev = levels[previousRisk] || 2;
            const curr = levels[currentRisk] || 2;

            if (curr < prev) {
                riskChangeTitle = 'Risk Improved';
                riskPriority = 'Low';
                riskStatus = 'Risk Improved';
            } else if (curr > prev) {
                riskChangeTitle = 'Risk Increased';
                riskPriority = 'High';
                riskStatus = 'Risk Increased';
            }
        }
        
        previousRisk = currentRisk;

        events.push({
            id: `pred_${p._id}`,
            type: 'Prediction',
            title: riskChangeTitle,
            description: `AI Analysis detected a ${currentRisk} risk level. [${riskStatus}]`,
            timestamp: p.createdAt,
            category: 'Prediction',
            priority: riskPriority,
            referenceId: p._id,
            data: { ...p, riskStatus }
        });
    });

    // 4. Messages (Teacher Sent Message)
    const messages = await Message.find({ receiverId: studentId }).lean();
    messages.forEach(m => {
        events.push({
            id: `msg_${m._id}`,
            type: 'Message',
            title: 'Teacher Sent Message',
            description: 'You received a new message from your teacher.',
            timestamp: m.createdAt,
            category: 'Messages',
            priority: 'Low',
            referenceId: m._id,
            data: m
        });
    });

    // 5. Notifications (General, Counseling, Teacher Notes)
    const notifications = await Notification.find({ receiverId: studentId }).lean();
    notifications.forEach(n => {
        let type = 'Notification';
        if (n.type === 'COUNSELING_REQUEST') type = 'Counseling';
        else if (n.type === 'TEACHER_NOTE') type = 'Teacher Note';
        else if (n.type === 'HIGH_RISK_ALERT') type = 'Security';

        events.push({
            id: `notif_${n._id}`,
            type: type,
            title: n.title,
            description: n.message,
            timestamp: n.createdAt,
            category: type,
            priority: n.priority || 'Low',
            referenceId: n._id,
            data: n
        });
    });

    // Sort Newest First
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Stats calculation
    const currentRiskLevel = predictions.length > 0 ? (predictions[predictions.length - 1].riskLevel || predictions[predictions.length - 1].prediction?.riskLevel || 'Unknown') : 'None';
    const stats = {
        totalAssessments: behaviors.length,
        predictionsGenerated: predictions.length,
        messagesExchanged: await Message.countDocuments({ $or: [{ senderId: studentId }, { receiverId: studentId }] }),
        currentRiskLevel: currentRiskLevel,
        accountAgeDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    };

    // Apply Pagination
    const totalEvents = events.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = events.slice(startIndex, endIndex);

    return {
        events: paginatedEvents,
        stats,
        pagination: {
            total: totalEvents,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalEvents / limit)
        }
    };
};

module.exports = {
    getStudentTimeline
};
