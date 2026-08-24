"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search, Check, CheckCheck, Loader2, UserCircle, MessageSquare, Shield, GraduationCap, Users } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<"chats" | "contacts">("chats");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUserId = currentUser?.id || currentUser?._id;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing stored user", e);
            }
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
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const [convRes, contactsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/conversations`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/contacts`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null)
            ]);

            if (convRes && convRes.ok) {
                const data = await convRes.json();
                if (data.success) setConversations(data.data);
            }

            if (contactsRes && contactsRes.ok) {
                const contactsData = await contactsRes.json();
                if (contactsData.success) setContacts(contactsData.data);
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
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);

                // Mark unread messages as read
                const unreadMessages = data.data.filter(
                    (m: any) => {
                        const recId = typeof m.receiverId === 'object' ? (m.receiverId._id || m.receiverId.id) : m.receiverId;
                        return recId === currentUserId && !m.isRead;
                    }
                );

                for (const msg of unreadMessages) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages/read/${msg._id}`, {
                        method: "PUT",
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(() => null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const getOtherUser = (conv: any) => {
        if (!conv) return { name: "User", role: "", _id: "" };

        if (conv.targetUser) return conv.targetUser;

        // Try participants array
        if (conv.participants && Array.isArray(conv.participants)) {
            const other = conv.participants.find((p: any) => {
                const pId = typeof p === "object" ? (p._id || p.id) : p;
                return pId?.toString() !== currentUserId?.toString();
            });
            if (other && typeof other === "object") {
                return {
                    _id: other._id || other.id,
                    name: other.fullName || other.name || other.email || "User",
                    email: other.email,
                    role: other.role,
                    department: other.department,
                    profilePhoto: other.profileImage || other.profilePhoto
                };
            }
        }

        // Try studentId vs teacherId
        const student = conv.studentId;
        const teacher = conv.teacherId;
        const studentIdStr = typeof student === "object" ? (student._id || student.id) : student;
        const isStudentMe = studentIdStr?.toString() === currentUserId?.toString();
        const other = isStudentMe ? teacher : student;

        if (other && typeof other === "object") {
            return {
                _id: other._id || other.id,
                name: other.fullName || other.name || other.email || "User",
                email: other.email,
                role: other.role,
                department: other.department,
                profilePhoto: other.profileImage || other.profilePhoto
            };
        }

        return { name: "User", role: "", _id: "" };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const token = localStorage.getItem("token");
            const otherUser = getOtherUser(activeConversation);
            const receiverId = otherUser._id || activeConversation.targetUserId;

            if (!receiverId) {
                console.error("No valid receiver ID found");
                return;
            }

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
                const sentMsg = data.data;
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage("");
                fetchConversations();
                if (!activeConversation._id && sentMsg.conversationId) {
                    setActiveConversation(prev => ({
                        ...prev,
                        _id: sentMsg.conversationId
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const startNewChat = (contact: any) => {
        const existingConv = conversations.find(c => {
            const other = getOtherUser(c);
            return other._id?.toString() === contact._id?.toString();
        });

        if (existingConv) {
            setActiveConversation(existingConv);
        } else {
            setActiveConversation({
                _id: null,
                targetUserId: contact._id,
                targetUser: contact,
                participants: [currentUserId, contact._id]
            });
            setMessages([]);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const other = getOtherUser(conv);
        return (
            other.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            other.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            other.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const filteredContacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadgeClass = (r: string) => {
        if (r === "admin") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (r === "teacher") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeOtherUser = activeConversation ? getOtherUser(activeConversation) : null;

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-r border-border flex flex-col bg-background/40">
                <div className="p-4 border-b border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Messages</h2>
                        <div className="flex bg-secondary p-0.5 rounded-lg border border-border">
                            <button
                                onClick={() => setActiveTab("chats")}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                                    activeTab === "chats" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Chats ({conversations.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("contacts")}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                                    activeTab === "contacts" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Contacts ({contacts.length})
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search contacts or messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-secondary/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary border border-border/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                    {activeTab === "chats" ? (
                        filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-xs space-y-3">
                                <MessageSquare className="h-10 w-10 mx-auto opacity-30 text-primary" />
                                <p>No active chats found.</p>
                                <Button variant="outline" size="sm" onClick={() => setActiveTab("contacts")} className="text-xs">
                                    Browse Contacts
                                </Button>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const other = getOtherUser(conv);
                                const isActive = activeConversation?._id === conv._id;

                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => setActiveConversation(conv)}
                                        className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-start gap-3 ${isActive ? 'bg-secondary' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            {other.profilePhoto ? (
                                                <img src={other.profilePhoto} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    <UserCircle className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-sm truncate pr-2 text-foreground">{other.name}</h3>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {conv.lastMessageTime ? format(new Date(conv.lastMessageTime), 'MMM d') : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs text-muted-foreground truncate flex-1">
                                                    {conv.lastMessage || "Click to open conversation"}
                                                </p>
                                                {other.role && (
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${getRoleBadgeClass(other.role)}`}>
                                                        {other.role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )
                    ) : (
                        filteredContacts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-xs">
                                <Users className="h-10 w-10 mx-auto opacity-30 text-primary mb-2" />
                                <p>No contacts available matching search.</p>
                            </div>
                        ) : (
                            filteredContacts.map(contact => (
                                <button
                                    key={contact._id}
                                    onClick={() => startNewChat(contact)}
                                    className="w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm truncate text-foreground">{contact.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{contact.department || contact.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${getRoleBadgeClass(contact.role)}`}>
                                        {contact.role}
                                    </span>
                                </button>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-1 flex-col bg-card relative">
                {activeConversation && activeOtherUser ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center justify-between bg-card/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-sm">{activeOtherUser.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {activeOtherUser.email} {activeOtherUser.department ? `• ${activeOtherUser.department}` : ''}
                                    </p>
                                </div>
                            </div>
                            {activeOtherUser.role && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getRoleBadgeClass(activeOtherUser.role)}`}>
                                    {activeOtherUser.role}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/20">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                                    <MessageSquare className="h-10 w-10 mb-2 opacity-20 text-primary" />
                                    <p>This is the start of your message thread with <span className="font-semibold text-foreground">{activeOtherUser.name}</span>.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const senderObj = typeof msg.senderId === 'object' ? msg.senderId : null;
                                    const senderIdStr = senderObj ? (senderObj._id || senderObj.id) : msg.senderId;
                                    const isMe = senderIdStr?.toString() === currentUserId?.toString();

                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                                isMe ? 'bg-primary text-white rounded-tr-xs' : 'bg-secondary text-foreground border border-border/40 rounded-tl-xs'
                                            }`}>
                                                <p className="whitespace-pre-wrap break-words">{msg.text || msg.message}</p>
                                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                    <span className="text-[10px]">
                                                        {format(new Date(msg.createdAt || Date.now()), 'HH:mm')}
                                                    </span>
                                                    {isMe && (
                                                        msg.isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-border bg-card/60">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={`Message ${activeOtherUser.name}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    maxLength={1000}
                                    className="flex-1 bg-secondary/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary border border-border/50 text-foreground"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="rounded-xl shrink-0 h-10 px-4 shadow-premium">
                                    <Send className="w-4 h-4 mr-1" /> Send
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
                        <div className="text-center max-w-sm space-y-3">
                            <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-foreground text-base">Instant Messaging Portal</h3>
                            <p className="text-xs leading-relaxed">
                                Select any contact or active conversation from the sidebar list to message teachers, advisors, or administrators.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
