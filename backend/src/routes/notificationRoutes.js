const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/read/:id', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
