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
    }
];

const seedAdmins = async () => {
    try {
        for (const adminData of defaultAdmins) {
            const existingUser = await User.findOne({ email: adminData.email });
            if (!existingUser) {
                await User.create(adminData);
                logger.info(`👑 Default Admin created: ${adminData.email}`);
            } else {
                // Ensure existing admin user has active/approved status
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
                if (updated) {
                    await existingUser.save({ validateBeforeSave: false });
                    logger.info(`👑 Updated status for Default Admin: ${adminData.email}`);
                }
            }
        }
    } catch (error) {
        logger.error(`Failed to seed default admins: ${error.message}`);
    }
};

module.exports = seedAdmins;
