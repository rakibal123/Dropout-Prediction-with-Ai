"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search, Check, CheckCheck, Loader2, UserCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

interface MessageInterfaceProps {
    role: "student" | "teacher" | "admin";
}

export function MessageInterface({ role }: MessageInterfaceProps) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation && activeConversation._id) {
            fetchMessages(activeConversation._id);
        } else if (activeConversation && !activeConversation._id) {
            setMessages([]);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
            
            const contactsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const contactsData = await contactsRes.json();
            if (contactsData.success) {
                setContacts(contactsData.data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                
                // Mark unread messages as read
                if (role !== "admin") {
                    const unreadMessages = data.data.filter(
                        (m: any) => m.receiverId === currentUser?.id && !m.isRead
                    );
                    
                    for (const msg of unreadMessages) {
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/read/${msg._id}`, {
                            method: "PUT",
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    }
                    
                    if (unreadMessages.length > 0) {
                        fetchConversations(); // refresh unread counts
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const token = localStorage.getItem("token");
            // Determine receiver based on participants
            const receiverId = activeConversation.participants.find(
                (p: string) => p !== currentUser.id
            );

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/send`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    receiverId,
                    message: newMessage.trim()
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessages([...messages, { ...data.data, senderId: currentUser }]);
                setNewMessage("");
                fetchConversations(); // update last message
                if (!activeConversation._id) {
                    setActiveConversation({
                        ...activeConversation,
                        _id: data.data.conversationId
                    });
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = role === 'student' || (role === 'admin' && conv.studentId) ? conv.teacherId : conv.studentId;
        return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const newContacts = contacts.filter(contact => {
        const hasConv = conversations.some(conv => {
            const otherUser = role === 'student' || (role === 'admin' && conv.studentId) ? conv.teacherId : conv.studentId;
            return otherUser?._id === contact._id;
        });
        if (hasConv) return false;
        return contact.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-border flex flex-col bg-background/50">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold mb-4">Conversations</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-secondary rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 && newContacts.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No conversations yet.</p>
                        </div>
                    ) : (
                        <>
                            {filteredConversations.map(conv => {
                                const otherUser = role === 'student' || (role === 'admin' && conv.studentId) ? conv.teacherId : conv.studentId;
                                const isActive = activeConversation?._id === conv._id;
                                
                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => setActiveConversation(conv)}
                                        className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors flex items-start gap-3 ${isActive ? 'bg-secondary' : ''}`}
                                    >
                                        {otherUser?.profilePhoto ? (
                                            <img src={otherUser.profilePhoto} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <UserCircle className="w-6 h-6 text-primary" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-medium text-sm truncate pr-2">{otherUser?.name || 'Unknown User'}</h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(conv.lastMessageTime), 'MMM d')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.lastMessage || "Click to start chatting"}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && role !== 'admin' && (
                                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                            
                            {newContacts.map(contact => (
                                <button
                                    key={contact._id}
                                    onClick={() => {
                                        setActiveConversation({
                                            _id: null,
                                            participants: [currentUser.id, contact._id],
                                            studentId: role === 'student' ? currentUser : contact,
                                            teacherId: role === 'student' ? contact : currentUser
                                        });
                                        setMessages([]);
                                    }}
                                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors flex items-start gap-3`}
                                >
                                    {contact.profilePhoto ? (
                                        <img src={contact.profilePhoto} alt={contact.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <UserCircle className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-medium text-sm truncate pr-2">{contact.name}</h3>
                                            <span className="text-xs text-primary whitespace-nowrap">New</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            Click to start chatting
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-card relative">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    {(role === 'student' ? activeConversation.teacherId?.name : activeConversation.studentId?.name) || 'User'}
                                </h3>
                                {role === 'student' && <p className="text-xs text-muted-foreground">{activeConversation.teacherId?.department}</p>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId?._id === currentUser?.id || msg.senderId === currentUser?.id;
                                
                                return (
                                    <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary text-secondary-foreground rounded-tl-sm'}`}>
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text || msg.message}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                <span className="text-[10px]">
                                                    {format(new Date(msg.createdAt || Date.now()), 'HH:mm')}
                                                </span>
                                                {isMe && (
                                                    msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-border bg-background/50">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    maxLength={1000}
                                    className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full shrink-0">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                            <div className="text-right mt-1 px-2">
                                <span className="text-[10px] text-muted-foreground">{newMessage.length}/1000</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
