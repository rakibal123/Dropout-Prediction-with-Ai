"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Users,
    AlertTriangle,
    TrendingUp,
    Search,
    MoreVertical,
    Mail,
    Calendar,
    Filter,
    BarChart3,
    ArrowUpRight
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
    const students = [
        { name: "Arifa Sultana", id: "S101", risk: "High", gpa: 2.1, attendance: "65%", lastActive: "3 days ago" },
        { name: "Tanvirul Islam", id: "S102", risk: "Medium", gpa: 2.8, attendance: "82%", lastActive: "Yesterday" },
        { name: "Nusrat Jahan", id: "S103", risk: "Low", gpa: 3.5, attendance: "95%", lastActive: "Today" },
        { name: "Mehedi Hasan", id: "S104", risk: "Low", gpa: 3.9, attendance: "98%", lastActive: "2 hours ago" },
        { name: "Rokeya Begum", id: "S105", risk: "High", gpa: 1.9, attendance: "58%", lastActive: "1 week ago" },
    ];

    const stats = [
        { label: "Total Students", value: "124", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "At Risk (High)", value: "12", icon: AlertTriangle, color: "text-risk-high", bg: "bg-red-100" },
        { label: "Avg. Attendance", value: "88%", icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Class Performance", value: "+4.2%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    ];

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Class Overview: CS101 - Spring 2026</h1>
                        <p className="text-muted-foreground">Monitor student engagement and identify potential dropouts.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Export Report
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Student List */}
                    <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-card pb-4">
                            <CardTitle className="text-lg">Student Risk Assessment</CardTitle>
                            <div className="relative w-48 sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search students..." className="pl-9 h-9" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30">
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Level</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">GPA / Attend.</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Activity</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-secondary/20 transition-colors group">
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{student.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">{student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${student.risk === "High" ? "bg-red-100 text-risk-high" :
                                                    student.risk === "Medium" ? "bg-amber-100 text-risk-medium" :
                                                        "bg-emerald-100 text-risk-low"
                                                    }`}>
                                                    {student.risk}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium">GPA: <span className="font-bold">{student.gpa}</span></p>
                                                    <div className="h-1.5 w-24 rounded-full bg-secondary">
                                                        <div
                                                            className={`h-full rounded-full ${student.attendance.startsWith('9') ? 'bg-risk-low' : student.attendance.startsWith('8') ? 'bg-risk-medium' : 'bg-risk-high'}`}
                                                            style={{ width: student.attendance }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-xs text-muted-foreground font-medium">
                                                {student.lastActive}
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-secondary/10 border-t border-border flex justify-center">
                                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-primary">
                                    View Full Class List
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Alerts & Analytics */}
                    <div className="space-y-6">
                        {/* Required Actions - Hidden for now
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    Required Actions
                                    <span className="bg-risk-high text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Priority</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { msg: "Arifa Sultana has missed 3 consecutive lectures.", type: "Attendance" },
                                    { msg: "Rokeya Begum's mid-term grade is below class average.", type: "Performance" },
                                    { msg: "Schedule follow-up meeting with Tanvirul Islam.", type: "Counseling" }
                                ].map((action, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{action.type}</p>
                                        <p className="text-sm text-foreground leading-snug">{action.msg}</p>
                                        <div className="pt-2 flex gap-2">
                                            <Button size="sm" className="h-8 text-xs flex-1">Address Now</Button>
                                            <Button variant="outline" size="sm" className="h-8 text-xs">Dismiss</Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        */}

                        <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 rotate-12 opacity-10">
                                <TrendingUp className="h-24 w-24" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Class Growth Predictions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Predicted Retention</span>
                                    <span className="text-xl font-bold text-emerald-400">92.4%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-emerald-400" style={{ width: "92.4%" }} />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-emerald-400/50 pl-3">
                                    Retention is trending upwards compared to last semester. Early interventions for high-risk students could push this to 95%.
                                </p>
                                <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 mt-2 h-10">
                                    Detailed AI Analytics
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
