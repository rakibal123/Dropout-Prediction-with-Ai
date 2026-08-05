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
    School,
    PieChart as PieChartIcon,
    RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
    CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [dashRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/admin/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            const dashData = await dashRes.json();
            const statsData = await statsRes.json();

            if (dashData.success) setStats(dashData.data);
            if (statsData.success) setAnalytics(statsData.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const topStats = [
        { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Total Teachers", value: stats?.totalTeachers || 0, icon: School, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Pending Approvals", value: stats?.pendingStudents || 0, icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "High Risk Students", value: stats?.highRisk || 0, icon: Activity, color: "text-rose-600", bg: "bg-rose-100" },
    ];

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <RefreshCcw className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Loading System Analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground">Manage institutional data, user roles, and system analytics.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData}>
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
                    {topStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-premium bg-card h-full">
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

                {/* Detailed Analytics Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                    <Card className="bg-secondary/30 border-none shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Predictions</p><p className="text-xl font-bold">{stats?.totalPredictions || 0}</p></CardContent></Card>
                    <Card className="bg-secondary/30 border-none shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Today's Assessments</p><p className="text-xl font-bold">{stats?.todaysAssessments || 0}</p></CardContent></Card>
                    <Card className="bg-secondary/30 border-none shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Approved Students</p><p className="text-xl font-bold text-emerald-500">{stats?.approvedStudents || 0}</p></CardContent></Card>
                    <Card className="bg-secondary/30 border-none shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Active Users Today</p><p className="text-xl font-bold text-blue-500">{stats?.activeUsersToday || 0}</p></CardContent></Card>
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. Risk Distribution Doughnut */}
                    <Card className="col-span-1 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-primary" />
                                Student Risk Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics?.riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {analytics?.riskDistribution?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 2. Department-wise Risk Analysis */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <School className="h-5 w-5 text-primary" />
                                Department-wise Risk Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.departmentRisk} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Legend />
                                    <Bar dataKey="Low" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="High" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 3. Monthly Assessment Trend */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-500" />
                                Monthly Assessment Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                                    <Bar dataKey="assessments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 4. Student Registration Trend */}
                    <Card className="col-span-1 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Registration Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics?.registrationTrend} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 5. Prediction Accuracy Trend */}
                    <Card className="col-span-1 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-emerald-500" />
                                Model Accuracy Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics?.accuracyTrend} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[85, 100]} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 6. Department Performance Comparison */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-premium bg-card">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Database className="h-5 w-5 text-orange-500" />
                                Department Performance Comparison
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.departmentPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                                    <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={100} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                                    <Bar dataKey="score" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
