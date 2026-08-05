const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

const getNotifications = async (userId, role) => {
    // Only return notifications intended for this user's role and ID
    const notifications = await Notification.find({ receiverId: userId, role })
        .sort('-createdAt');
    return notifications;
};

const getUnreadCount = async (userId, role) => {
    const count = await Notification.countDocuments({ receiverId: userId, role, isRead: false });
    return { count };
};

const markAsRead = async (notificationId, userId, role) => {
    const notification = await Notification.findOne({ _id: notificationId, receiverId: userId, role });
    if (!notification) {
        throw new AppError('Notification not found or unauthorized', 404);
    }
    notification.isRead = true;
    await notification.save();
    return notification;
};

const markAllAsRead = async (userId, role) => {
    const result = await Notification.updateMany(
        { receiverId: userId, role, isRead: false },
        { isRead: true }
    );
    return result;
};

const deleteNotification = async (notificationId, userId, role) => {
    const notification = await Notification.findOne({ _id: notificationId, receiverId: userId, role });
    if (!notification) {
        throw new AppError('Notification not found or unauthorized', 404);
    }
    await Notification.deleteOne({ _id: notificationId });
    return { success: true };
};

// Utility function to create notifications internally (for future usage)
const createNotification = async (data) => {
    const notification = new Notification(data);
    await notification.save();
    return notification;
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
