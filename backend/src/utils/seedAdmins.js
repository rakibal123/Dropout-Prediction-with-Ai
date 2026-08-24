const User = require('../models/User');
const logger = require('./logger');

const defaultAdmins = [
    {
        fullName: "System Admin 1",
        email: "admin1@university.edu",
        password: "AdminPassword123!",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "Central IT & System Administration"
    },
    {
        fullName: "System Admin 2",
        email: "admin2@university.edu",
        password: "AdminPassword123!",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "Academic Affairs Administration"
    },
    {
        fullName: "System Admin 3",
        email: "admin3@university.edu",
        password: "AdminPassword123!",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "Student Operations Administration"
    },
    {
        fullName: "GrammarFlow Admin 1",
        email: "admin@grammarflow.com",
        password: "Admin@123456",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "System Administration"
    },
    {
        fullName: "GrammarFlow Admin 2",
        email: "admin2@grammarflow.com",
        password: "Admin2@123456",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "System Administration"
    },
    {
        fullName: "GrammarFlow Admin 3",
        email: "admin3@grammarflow.com",
        password: "Admin3@123456",
        role: "admin",
        status: "approved",
        approved: true,
        isActive: true,
        department: "System Administration"
    }
];

const seedAdmins = async () => {
    try {
        for (const adminData of defaultAdmins) {
            const existingUser = await User.findOne({ email: adminData.email }).select('+password');
            if (!existingUser) {
                await User.create(adminData);
                logger.info(`👑 Default Admin created: ${adminData.email}`);
            } else {
                let updated = false;
                if (existingUser.role !== 'admin') {
                    existingUser.role = 'admin';
                    updated = true;
                }
                if (existingUser.status !== 'approved' && existingUser.status !== 'active') {
                    existingUser.status = 'approved';
                    existingUser.approved = true;
                    updated = true;
                }
                const isMatch = await existingUser.matchPassword(adminData.password);
                if (!isMatch) {
                    existingUser.password = adminData.password;
                    updated = true;
                }
                if (updated) {
                    await existingUser.save();
                    logger.info(`👑 Updated status/password for Default Admin: ${adminData.email}`);
                }
            }
        }
    } catch (error) {
        logger.error(`Failed to seed default admins: ${error.message}`);
    }
};

module.exports = seedAdmins;
