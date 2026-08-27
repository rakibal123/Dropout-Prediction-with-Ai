"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { 
    BarChart4, TrendingUp, Award, CheckCircle2, Clock, BookOpen, 
    Zap, AlertCircle, FileText, ChevronRight, Target, ArrowUpRight, 
    ArrowDownRight, RefreshCw, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function StudentProgressPage() {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [behavior, setBehavior] = useState<any>(null);
    const [selectedSemester, setSelectedSemester] = useState("Spring 2026");
    const { showToast } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [dashRes, behavRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/student/dashboard`, { headers }).catch(() => null),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/student/behavior/latest`, { headers }).catch(() => null)
            ]);

            if (dashRes && dashRes.ok) {
                const d = await dashRes.json();
                setDashboardData(d.data);
            }
            if (behavRes && behavRes.ok) {
                const b = await behavRes.json();
                setBehavior(b.data);
            }
        } catch (error) {
            console.error("Error loading progress data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const attPct = behavior?.attendancePercentage;
    const subPct = behavior?.assignmentSubmissionRate;
    const quizAvg = behavior?.quizAverage;
    const studyHours = behavior?.studyHoursPerWeek;

    const subjects: any[] = [];
    const milestones: any[] = [];
    const weeklyProgress: any[] = [];

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Academic Progress & Mastery</h1>
                        <p className="text-muted-foreground">Detailed analytical insights into your academic performance, attendance, and course engagement.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            value={selectedSemester} 
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-input bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Spring 2026">Spring Semester 2026</option>
                            <option value="Fall 2025">Fall Semester 2025</option>
                            <option value="Spring 2025">Spring Semester 2025</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={fetchData} className="h-10">
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Key Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cumulative GPA</p>
                                    {dashboardData?.gpa ? (
                                        <>
                                            <h3 className="text-3xl font-black mt-1 text-foreground">{dashboardData.gpa} <span className="text-xs font-normal text-muted-foreground">/ 4.0</span></h3>
                                        </>
                                    ) : (
                                        <h3 className="text-xl font-bold mt-1 text-muted-foreground">No Data</h3>
                                    )}
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Award className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Attendance</p>
                                    {attPct !== undefined ? (
                                        <h3 className="text-3xl font-black mt-1 text-purple-400">{attPct}%</h3>
                                    ) : (
                                        <h3 className="text-xl font-bold mt-1 text-muted-foreground">No Data</h3>
                                    )}
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignments Submitted</p>
                                    {subPct !== undefined ? (
                                        <h3 className="text-3xl font-black mt-1 text-blue-400">{subPct}%</h3>
                                    ) : (
                                        <h3 className="text-xl font-bold mt-1 text-muted-foreground">No Data</h3>
                                    )}
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Study Time</p>
                                    {studyHours !== undefined ? (
                                        <h3 className="text-3xl font-black mt-1 text-amber-400">{studyHours} <span className="text-xs font-normal text-muted-foreground">hrs/wk</span></h3>
                                    ) : (
                                        <h3 className="text-xl font-bold mt-1 text-muted-foreground">No Data</h3>
                                    )}
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                    <BarChart4 className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Subject Performance Table & Mastery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-premium bg-card overflow-hidden">
                        <CardHeader className="border-b border-border bg-card/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" /> Subject-wise Performance Breakdown
                                    </CardTitle>
                                    <CardDescription>Current semester course scores and engagement indicators</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {subjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="font-medium">No academic results available yet.</p>
                                    <p className="text-xs mt-1">Your subject-wise performance will appear here once records are available.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/20 border-b border-border">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Course</th>
                                                <th className="px-6 py-3 font-semibold">Overall Grade</th>
                                                <th className="px-6 py-3 font-semibold">Attendance</th>
                                                <th className="px-6 py-3 font-semibold">Assignments</th>
                                                <th className="px-6 py-3 font-semibold">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {subjects.map((s, idx) => (
                                                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-3 w-3 rounded-full ${s.color}`} />
                                                            <div>
                                                                <p className="font-semibold text-foreground">{s.name}</p>
                                                                <p className="text-xs text-muted-foreground">{s.code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-foreground">{s.score}%</span>
                                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">{s.grade}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-24">
                                                            <div className="flex justify-between text-xs mb-1 font-medium">
                                                                <span>{s.attendance}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div className={`h-full ${s.attendance >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${s.attendance}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-foreground">
                                                        {s.assignments}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`flex items-center gap-1 text-xs font-bold ${s.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {s.trend.startsWith('+') ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                                            {s.trend}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Milestones & Badges */}
                    <Card className="border-none shadow-premium bg-card flex flex-col justify-between">
                        <CardHeader className="border-b border-border bg-card/50 px-6 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="h-5 w-5 text-amber-500" /> Recent Achievements
                            </CardTitle>
                            <CardDescription>Academic badges and milestone achievements</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 flex-1">
                            {milestones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground h-full">
                                    <Award className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No milestones reached yet.</p>
                                </div>
                            ) : (
                                milestones.map((m, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-border/40">
                                        <div className={`p-2.5 rounded-xl ${m.color} shrink-0`}>
                                            <m.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-sm text-foreground">{m.title}</h4>
                                                <span className="text-[10px] text-muted-foreground font-medium">{m.date}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <div className="p-4 border-t border-border">
                            <Button variant="outline" className="w-full text-xs" onClick={() => showToast("Badge catalog feature coming soon!", "info")} disabled={milestones.length === 0}>
                                View All Earned Badges <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Weekly Trend Breakdown Visualizer */}
                <Card className="border-none shadow-premium bg-card">
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" /> Weekly Performance Progression
                        </CardTitle>
                        <CardDescription>Tracking week-over-week attendance, quiz averages, and assignment completion rates</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {weeklyProgress.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
                                <p className="font-medium text-sm">No progression data available yet.</p>
                                <p className="text-xs mt-1">Weekly trends will appear after your first few weeks.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                {weeklyProgress.map((w, idx) => (
                                    <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-secondary/20 border border-border/40 hover:border-primary/40 transition-all">
                                        <span className="text-xs font-bold uppercase text-muted-foreground mb-3">{w.week}</span>
                                        <div className="w-full space-y-2">
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5 font-medium">
                                                    <span>Att</span>
                                                    <span className="text-purple-400 font-bold">{w.attendance}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500" style={{ width: `${w.attendance}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5 font-medium">
                                                    <span>Quiz</span>
                                                    <span className="text-amber-400 font-bold">{w.quiz}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: `${w.quiz}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5 font-medium">
                                                    <span>Sub</span>
                                                    <span className="text-blue-400 font-bold">{w.submission}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${w.submission}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
