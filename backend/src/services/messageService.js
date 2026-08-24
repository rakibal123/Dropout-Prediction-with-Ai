const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/appError');

const getConversations = async (userId, role) => {
    // Return all conversations where the user is a participant
    const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'fullName email role profileImage department')
        .populate('studentId', 'fullName email profileImage role')
        .populate('teacherId', 'fullName email profileImage department role')
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
    
    if (role !== 'admin' && !conversation.participants.some(p => p.toString() === userId.toString())) {
        throw new AppError("Unauthorized access to this conversation", 403);
    }
    
    const messages = await Message.find({ conversationId })
        .populate('senderId', 'fullName role profileImage')
        .sort('createdAt');
        
    return messages;
};

const sendMessage = async (senderId, senderRole, receiverId, text) => {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new AppError("Receiver not found", 404);
    }
    
    let studentId = senderId;
    let teacherId = receiverId;
    
    if (senderRole === 'student' && receiver.role === 'teacher') {
        studentId = senderId;
        teacherId = receiverId;
    } else if (senderRole === 'teacher' && receiver.role === 'student') {
        studentId = receiverId;
        teacherId = senderId;
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
    
    await message.populate('senderId', 'fullName role profileImage');
    
    return message;
};

const markAsRead = async (messageId, userId, role) => {
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

const getContacts = async (userId, role) => {
    let users = [];
    if (role === 'student') {
        users = await User.find({ _id: { $ne: userId }, role: { $in: ['teacher', 'admin'] } })
            .select('fullName email role profileImage department');
    } else if (role === 'teacher') {
        users = await User.find({ _id: { $ne: userId }, role: { $in: ['student', 'admin', 'teacher'] } })
            .select('fullName email role profileImage department');
    } else if (role === 'admin') {
        users = await User.find({ _id: { $ne: userId } })
            .select('fullName email role profileImage department');
    }
    
    return users.map(u => ({
        _id: u._id,
        name: u.fullName || u.email,
        email: u.email,
        role: u.role,
        department: u.department,
        profilePhoto: u.profileImage && u.profileImage !== 'default.jpg' ? u.profileImage : null
    }));
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getContacts
};
