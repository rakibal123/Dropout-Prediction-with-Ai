"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Loader2, Info, AlertTriangle, ShieldAlert, BookOpen, UserCircle, Settings } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter((n: any) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notifications/read/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notifications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const filtered = notifications.filter(n => n._id !== id);
            setNotifications(filtered);
            setUnreadCount(filtered.filter((n: any) => !n.isRead).length);
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        
        setIsOpen(false);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const role = user.role || "student";

        // Auto Redirection Logic
        switch (notification.type) {
            case "NEW_PREDICTION":
                router.push(`/dashboard/${role}/prediction-history`);
                break;
            case "NEW_MESSAGE":
                router.push(`/dashboard/${role}/messages`);
                break;
            case "ACCOUNT_APPROVED":
                router.push(`/dashboard/${role}`);
                break;
            case "HIGH_RISK_ALERT":
                router.push(`/dashboard/${role}/students`);
                break;
            default:
                break;
        }
    };

    const getIcon = (type: string, priority: string) => {
        if (priority === "Critical" || priority === "High") return <ShieldAlert className="w-5 h-5 text-risk-high" />;
        if (type.includes("MESSAGE")) return <BookOpen className="w-5 h-5 text-primary" />;
        if (type.includes("ACCOUNT") || type.includes("PROFILE")) return <UserCircle className="w-5 h-5 text-blue-500" />;
        if (type.includes("PREDICTION")) return <AlertTriangle className="w-5 h-5 text-risk-medium" />;
        return <Info className="w-5 h-5 text-muted-foreground" />;
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "Unread" && n.isRead) return false;
        if (filter === "Read" && !n.isRead) return false;
        if (filter === "High Priority" && !["High", "Critical"].includes(n.priority)) return false;
        
        if (search) {
            const searchLower = search.toLowerCase();
            return n.title.toLowerCase().includes(searchLower) || n.message.toLowerCase().includes(searchLower);
        }
        return true;
    });

    return (
        <div className="relative" ref={dropdownRef}>
            <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-9 w-9 p-0 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-risk-high ring-2 ring-card flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75"></span>
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                Notifications 
                                {unreadCount > 0 && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                            </h3>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs text-muted-foreground hover:text-primary">
                                    <CheckCheck className="w-4 h-4 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                        </div>

                        {/* Filters & Search */}
                        <div className="p-3 border-b border-border space-y-3 bg-secondary/30">
                            <input 
                                type="text"
                                placeholder="Search notifications..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                {["All", "Unread", "Read", "High Priority"].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            {loading ? (
                                <div className="p-8 flex justify-center items-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications available.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredNotifications.map(notification => (
                                        <div 
                                            key={notification._id} 
                                            className={`p-4 border-b border-border/50 transition-colors flex gap-3 group ${!notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary'}`}
                                        >
                                            <div className="shrink-0 mt-1">
                                                {getIcon(notification.type, notification.priority)}
                                            </div>
                                            <div 
                                                className="flex-1 min-w-0 cursor-pointer"
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm truncate pr-2 ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                                                        {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                                    </span>
                                                </div>
                                                <p className={`text-xs break-words line-clamp-2 ${!notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex flex-col justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.isRead && (
                                                    <button onClick={() => markAsRead(notification._id)} className="text-muted-foreground hover:text-primary" title="Mark as read">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteNotification(notification._id)} className="text-muted-foreground hover:text-destructive" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="p-2 border-t border-border bg-secondary/30 text-center">
                            <span className="text-[10px] text-muted-foreground">Notifications update automatically every 30s.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
