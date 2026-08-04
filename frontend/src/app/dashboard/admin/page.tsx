"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    ShieldCheck,
    Settings,
    Users,
    Database,
    Cpu,
    Activity,
    ArrowUpRight,
    School,
    PieChart,
    BarChart4,
    RefreshCcw,
    Search,
    MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
    const stats = [
        { label: "Total Students", value: "14,205", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Active Teachers", value: "482", icon: School, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Model Accuracy", value: "97.8%", icon: BrainCircuit, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Storage Used", value: "1.2 TB", icon: Database, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    const recentUsers = [
        { name: "Dr. Sarah Miller", role: "Teacher", dept: "Mathematics", status: "Active", joined: "2 hours ago" },
        { name: "John Doe", role: "Student", dept: "Computer Science", status: "Active", joined: "Oct 2025" },
        { name: "Admin_Alpha", role: "Admin", dept: "IT Support", status: "Active", joined: "Jan 2024" },
        { name: "Michael Chen", role: "Student", dept: "Physics", status: "Inactive", joined: "Nov 2025" },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground">Manage institutional data, user roles, and prediction AI parameters.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Sync Data
                        </Button>
                        <Button size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configuration
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* System Health & Risk Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Institutional Risk Trends (Annual)</CardTitle>
                            <div className="flex gap-2">
                                <div className="h-2 w-8 bg-primary rounded-full" />
                                <div className="h-2 w-8 bg-risk-medium rounded-full" />
                                <div className="h-2 w-8 bg-risk-high rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pb-4">
                            <div className="flex items-end justify-between h-56 gap-4">
                                {[30, 45, 60, 40, 75, 55, 90, 80, 65, 50, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 space-y-2">
                                        <div className="flex flex-col gap-0.5 h-48 justify-end">
                                            <div className="w-full bg-primary/80 rounded-t-sm" style={{ height: `${h}%` }} />
                                            <div className="w-full bg-risk-medium/60 rounded-sm" style={{ height: `${h / 2.5}%` }} />
                                            <div className="w-full bg-risk-high/40 rounded-sm" style={{ height: `${h / 6}%` }} />
                                        </div>
                                        <p className="text-[10px] text-center text-muted-foreground font-bold">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-none shadow-md bg-primary text-primary-foreground">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Cpu className="h-5 w-5" />
                                    AI Engine Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-80">Execution Speed</span>
                                    <span className="font-bold">42ms</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-80">Resources</span>
                                    <div className="flex gap-1">
                                        {[1, 1, 1, 1, 0].map((v, i) => (
                                            <div key={i} className={`h-4 w-1.5 rounded-full ${v ? 'bg-white' : 'bg-white/20'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs italic opacity-80 leading-relaxed mb-4">
                                        The prediction model was last tuned 14 hours ago. Current confidence level: 98.2%.
                                    </p>
                                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary h-10">
                                        Neural Analytics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Real-time Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="px-4 py-2 bg-secondary/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-y border-border">
                                    Live Stream
                                </div>
                                <div className="divide-y divide-border font-mono text-[11px]">
                                    {[
                                        { log: "Syncing DB_RECORDS with SIS...", t: "12:04:22" },
                                        { log: "Model inference completed: 42 students.", t: "12:04:18" },
                                        { log: "User Sarah_M sign_in: success.", t: "12:03:55" },
                                        { log: "Alert triggered: StudentID_S101_High_Risk", t: "12:01:10" },
                                    ].map((log, i) => (
                                        <div key={i} className="p-3 px-6 hover:bg-secondary/20 flex justify-between gap-4">
                                            <span className="text-slate-600 truncate">{log.log}</span>
                                            <span className="text-primary font-bold shrink-0">{log.t}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

// Mock icon for internal Use
function BrainCircuit({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a3 3 0 0 0-3 3v7" />
            <path d="M9 12a3 3 0 0 0-3 3v2" />
            <path d="M6 17a3 3 0 0 1-3 3" />
            <path d="M12 2a3 3 0 0 1 3 3v7" />
            <path d="M15 12a3 3 0 0 1 3 3v2" />
            <path d="M18 17a3 3 0 0 0 3 3" />
            <path d="M12 22v-5" />
            <path d="M9 17h6" />
        </svg>
    );
}
