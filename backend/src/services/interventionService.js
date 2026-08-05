const Intervention = require('../models/Intervention');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createIntervention = async (data) => {
    const intervention = await Intervention.create({
        studentId: data.studentId,
        assignedBy: data.assignedBy,
        type: data.type,
        actionDetails: data.actionDetails,
        dueDate: data.dueDate
    });

    // Notify the student
    await Notification.create({
        receiverId: data.studentId,
        senderId: data.assignedBy,
        title: `New Intervention: ${data.type}`,
        message: data.actionDetails,
        type: 'COUNSELING_REQUEST',
        priority: 'High',
        role: 'student'
    });

    return intervention;
};

const getInterventions = async (departmentFilter) => {
    // If a teacher requests, we only want their department students.
    let query = {};
    if (departmentFilter) {
        const students = await User.find({ department: departmentFilter, role: 'student' }).select('_id');
        query = { studentId: { $in: students.map(s => s._id) } };
    }
    
    return await Intervention.find(query).populate('studentId', 'fullName department email').populate('assignedBy', 'fullName').sort({ createdAt: -1 });
};

module.exports = {
    createIntervention,
    getInterventions
};
