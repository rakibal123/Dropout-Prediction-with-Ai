const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getNotifications(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: notifications });
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const data = await notificationService.getUnreadCount(req.user.id, req.user.role);
    res.status(200).json({ success: true, data });
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id, req.user.role);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
});

const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, message: "Notification deleted" });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
