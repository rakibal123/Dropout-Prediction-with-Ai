"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
    BrainCircuit, ClipboardList, BookOpen, HeartPulse, 
    MessageSquare, Bell, Shield, User, Loader2, ArrowDownUp, Search, 
    X, Trophy, ArrowRight, Activity, TrendingUp, CheckCircle, TrendingDown, Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS: Record<string, string> = {
    Account: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Prediction: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Assessment: "bg-green-500/10 text-green-500 border-green-500/20",
    TeacherNote: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Counseling: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    Messages: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    Security: "bg-red-500/10 text-red-500 border-red-500/20",
    Notification: "bg-gray-500/10 text-gray-500 border-gray-500/20"
};

const CATEGORY_ICONS: Record<string, any> = {
    Account: User,
    Prediction: BrainCircuit,
    Assessment: ClipboardList,
    TeacherNote: BookOpen,
    Counseling: HeartPulse,
    Messages: MessageSquare,
    Security: Shield,
    Notification: Bell
};

export function TimelineView() {
    const [events, setEvents] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [order, setOrder] = useState<"desc" | "asc">("desc");
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const fetchTimeline = async (pageNum = 1) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/student/timeline?page=${pageNum}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                if (pageNum === 1) {
                    setEvents(data.data);
                } else {
                    setEvents(prev => [...prev, ...data.data]);
                }
                setStats(data.stats);
                setHasMore(data.pagination.page < data.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch timeline", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTimeline(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTimeline(nextPage);
    };

    const sortedAndFilteredEvents = events
        .filter(e => filter === "All" || e.category === filter)
        .filter(e => search === "" || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return order === "desc" ? dateB - dateA : dateA - dateB;
        });

    if (loading && page === 1) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const categories = ["All", "Assessment", "Prediction", "Messages", "Security", "Account"];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Statistics Top Bar */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Risk Level</p>
                        <p className={`text-xl font-bold ${stats.currentRiskLevel === 'High' ? 'text-risk-high' : stats.currentRiskLevel === 'Medium' ? 'text-risk-medium' : 'text-risk-low'}`}>
                            {stats.currentRiskLevel}
                        </p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Assessments</p>
                        <p className="text-xl font-bold">{stats.totalAssessments}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Predictions</p>
                        <p className="text-xl font-bold">{stats.predictionsGenerated}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Messages</p>
                        <p className="text-xl font-bold">{stats.messagesExchanged}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Account Age</p>
                        <p className="text-xl font-bold">{stats.accountAgeDays} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center justify-center gap-2 shadow-sm">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Badges</p>
                            <p className="text-sm font-bold">{stats.totalAssessments > 5 ? 'Active Learner' : 'Beginner'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    {categories.map(c => (
                        <button 
                            key={c}
                            onClick={() => setFilter(c)}
                            className={`whitespace-nowrap px-4 py-1.5 text-sm rounded-full border transition-colors ${filter === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Search timeline..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-secondary border-none rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setOrder(order === "desc" ? "asc" : "desc")}>
                        <ArrowDownUp className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative px-4 sm:px-0">
                <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2"></div>
                
                {sortedAndFilteredEvents.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground relative z-10 bg-background/80 backdrop-blur-sm rounded-xl">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No academic journey available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative z-10">
                        {sortedAndFilteredEvents.map((event, index) => {
                            const Icon = CATEGORY_ICONS[event.category] || Bell;
                            const isLeft = index % 2 === 0;
                            const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Notification;

                            return (
                                <div key={event.id} className={`flex flex-col sm:flex-row items-start sm:items-center w-full ${isLeft ? 'sm:justify-start' : 'sm:justify-end'} relative`}>
                                    
                                    {/* Center Node */}
                                    <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-card z-20">
                                        <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></div>
                                    </div>

                                    {/* Card */}
                                    <div className={`w-full sm:w-[calc(50%-2rem)] pl-12 sm:pl-0 ${isLeft ? 'sm:pr-12' : 'sm:pl-12'}`}>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            onClick={() => setSelectedEvent(event)}
                                            className={`p-5 rounded-xl border bg-card shadow-sm hover:shadow-md cursor-pointer transition-all ${colorClass.split(' ')[2]}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm truncate">{event.title}</h3>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(event.timestamp), "MMM d, yyyy • h:mm a")}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {hasMore && sortedAndFilteredEvents.length > 0 && (
                <div className="text-center pt-8">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Load More Events
                    </Button>
                </div>
            )}

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-10"
                        >
                            {/* Modal Header */}
                            <div className={`p-6 border-b border-border flex items-center gap-4 ${(CATEGORY_COLORS[selectedEvent.category] || CATEGORY_COLORS.Notification).split(' ')[0]}`}>
                                <div className="p-3 bg-background/50 rounded-xl">
                                    {(() => {
                                        const Icon = CATEGORY_ICONS[selectedEvent.category] || Bell;
                                        return <Icon className="w-6 h-6" />;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold">{selectedEvent.title}</h2>
                                    <p className="text-sm opacity-80">{format(new Date(selectedEvent.timestamp), "MMMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-full hover:bg-background/50 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-sm">{selectedEvent.description}</p>
                                </div>
                                
                                {selectedEvent.category === 'Prediction' && selectedEvent.data && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                                                <p className="text-xs text-muted-foreground uppercase mb-1">Risk Status</p>
                                                <p className={`font-bold flex items-center gap-1 ${
                                                    selectedEvent.data.riskStatus === 'Risk Improved' ? 'text-green-500' : 
                                                    selectedEvent.data.riskStatus === 'Risk Increased' ? 'text-red-500' : 'text-yellow-500'
                                                }`}>
                                                    {selectedEvent.data.riskStatus === 'Risk Improved' && <TrendingDown className="w-4 h-4" />}
                                                    {selectedEvent.data.riskStatus === 'Risk Increased' && <TrendingUp className="w-4 h-4" />}
                                                    {selectedEvent.data.riskStatus}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                                                <p className="text-xs text-muted-foreground uppercase mb-1">Confidence</p>
                                                <p className="font-bold">{selectedEvent.data.prediction?.confidence || 'N/A'}%</p>
                                            </div>
                                        </div>

                                        {selectedEvent.data.explanation?.topFactors && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Factors</h4>
                                                <ul className="space-y-2">
                                                    {selectedEvent.data.explanation.topFactors.map((f: any, i: number) => (
                                                        <li key={i} className="flex justify-between text-sm p-2 bg-secondary/20 rounded-md">
                                                            <span>{f.feature}</span>
                                                            <span className="font-semibold text-primary">{f.value}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedEvent.category === 'Assessment' && selectedEvent.data && (
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                            <span className="text-muted-foreground block text-xs">Attendance</span>
                                            <span className="font-semibold">{selectedEvent.data.attendancePercentage}%</span>
                                        </div>
                                        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                            <span className="text-muted-foreground block text-xs">Assignments</span>
                                            <span className="font-semibold">{selectedEvent.data.assignmentSubmissionRate}%</span>
                                        </div>
                                        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                            <span className="text-muted-foreground block text-xs">Stress Level</span>
                                            <span className="font-semibold">{selectedEvent.data.stressLevel}/10</span>
                                        </div>
                                        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                            <span className="text-muted-foreground block text-xs">Motivation</span>
                                            <span className="font-semibold">{selectedEvent.data.motivationLevel}/10</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
