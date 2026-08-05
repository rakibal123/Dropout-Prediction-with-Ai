const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.put('/read/:messageId', messageController.markAsRead);

module.exports = router;
