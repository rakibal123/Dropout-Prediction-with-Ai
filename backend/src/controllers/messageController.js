const messageService = require('../services/messageService');
const asyncHandler = require('../utils/asyncHandler');

const getConversations = asyncHandler(async (req, res) => {
    const conversations = await messageService.getConversations(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: conversations });
});

const getMessages = asyncHandler(async (req, res) => {
    const messages = await messageService.getMessages(req.params.conversationId, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: messages });
});

const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    const sentMessage = await messageService.sendMessage(req.user.id, req.user.role, receiverId, message);
    res.status(201).json({ success: true, data: sentMessage });
});

const markAsRead = asyncHandler(async (req, res) => {
    const message = await messageService.markAsRead(req.params.messageId, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: message });
});

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
};
