const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/appError');

const getConversations = async (userId, role) => {
    let query = {};
    if (role !== 'admin') {
        query = { participants: userId };
    }
    
    const conversations = await Conversation.find(query)
        .populate('studentId', 'name email profilePhoto')
        .populate('teacherId', 'name email profilePhoto department')
        .sort('-updatedAt');
        
    const result = [];
    for (let conv of conversations) {
        const lastMessage = await Message.findOne({ conversationId: conv._id }).sort('-createdAt');
        const unreadCount = await Message.countDocuments({ 
            conversationId: conv._id, 
            receiverId: userId, 
            isRead: false 
        });
        
        result.push({
            ...conv.toObject(),
            lastMessage: lastMessage ? lastMessage.text : null,
            lastMessageTime: lastMessage ? lastMessage.createdAt : conv.updatedAt,
            unreadCount
        });
    }
    
    result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    return result;
};

const getMessages = async (conversationId, userId, role) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError("Conversation not found", 404);
    }
    
    if (role !== 'admin' && !conversation.participants.includes(userId)) {
        throw new AppError("Unauthorized access to this conversation", 403);
    }
    
    const messages = await Message.find({ conversationId })
        .populate('senderId', 'name role profilePhoto')
        .sort('createdAt');
        
    return messages;
};

const sendMessage = async (senderId, senderRole, receiverId, text) => {
    if (senderRole === 'admin') {
        throw new AppError("Admins cannot send messages, only view", 403);
    }
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new AppError("Receiver not found", 404);
    }
    
    let studentId, teacherId;
    if (senderRole === 'student' && receiver.role === 'teacher') {
        studentId = senderId;
        teacherId = receiverId;
    } else if (senderRole === 'teacher' && receiver.role === 'student') {
        studentId = receiverId;
        teacherId = senderId;
    } else {
        throw new AppError("Messaging is only allowed between students and teachers", 400);
    }
    
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
    });
    
    if (!conversation) {
        conversation = new Conversation({
            participants: [senderId, receiverId],
            studentId,
            teacherId
        });
        await conversation.save();
    }
    
    const message = new Message({
        conversationId: conversation._id,
        senderId,
        receiverId,
        text,
        messageType: 'text'
    });
    
    await message.save();
    
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    return message;
};

const markAsRead = async (messageId, userId, role) => {
    if (role === 'admin') {
        throw new AppError("Admins cannot mark messages as read", 403);
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
        throw new AppError("Message not found", 404);
    }
    
    if (message.receiverId.toString() !== userId.toString()) {
        throw new AppError("You can only mark your own messages as read", 403);
    }
    
    message.isRead = true;
    await message.save();
    
    return message;
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
};
