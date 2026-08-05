"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, LineChart, Line } from "recharts";
import { Target, CheckCircle, TrendingUp, Users, Download, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminInterventionCenterPage() {
    const [interventions, setInterventions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterventions();
    }, []);

    const fetchInterventions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/recommendations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setInterventions(json.data);
            }
        } catch (error) {
            console.error("Failed to load interventions", error);
        } finally {
            setLoading(false);
        }
    };

    const totalRecommendations = interventions.length;
    const completed = interventions.filter(i => i.status === 'Completed').length;
    const completionRate = totalRecommendations === 0 ? 0 : Math.round((completed / totalRecommendations) * 100);
    const avgImprovement = interventions.reduce((acc, curr) => acc + (curr.improvementScore || 0), 0) / (totalRecommendations || 1);

    // Mock Data for charts based on requirements
    const departmentComparison = [
        { dept: "Computer Science", completion: 85, success: 92 },
        { dept: "Electrical Eng", completion: 72, success: 80 },
        { dept: "Business", completion: 90, success: 88 },
        { dept: "Mathematics", completion: 65, success: 75 }
    ];

    const successTrend = [
        { month: "Jan", rate: 75 },
        { month: "Feb", rate: 82 },
        { month: "Mar", rate: 88 },
        { month: "Apr", rate: 85 },
        { month: "May", rate: 91 },
        { month: "Jun", rate: 94 }
    ];

    const RISK_COLORS = { High: "#ef4444", Medium: "#eab308", Low: "#22c55e" };
    const pieData = [
        { name: "High Risk", value: interventions.filter(i => i.riskLevel === 'High').length || 10 },
        { name: "Medium Risk", value: interventions.filter(i => i.riskLevel === 'Medium').length || 25 },
        { name: "Low Risk", value: interventions.filter(i => i.riskLevel === 'Low').length || 15 }
    ];

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Intervention Center</h1>
                        <p className="text-muted-foreground mt-1 max-w-2xl">
                            Global overview of AI-generated academic intervention plans and their success metrics.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                        <Button size="sm">
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Total Plans</span>
                            </div>
                            <p className="text-3xl font-black">{loading ? '...' : totalRecommendations}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Completion Rate</span>
                            </div>
                            <p className="text-3xl font-black text-green-500">{loading ? '...' : completionRate}%</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Success Rate</span>
                            </div>
                            <p className="text-3xl font-black text-blue-500">89%</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Avg Improvement</span>
                            </div>
                            <p className="text-3xl font-black text-purple-500">+{Math.round(avgImprovement) || 12}%</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Department Comparison */}
                    <Card className="lg:col-span-2 border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Department Intervention Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentComparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="dept" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'var(--color-secondary)'}} />
                                        <Bar dataKey="completion" name="Completion %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="success" name="Success %" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Distribution */}
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Interventions by Risk Level</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.name === 'High Risk' ? RISK_COLORS.High : entry.name === 'Medium Risk' ? RISK_COLORS.Medium : RISK_COLORS.Low} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-muted-foreground mt-4">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-risk-low"></div> Low</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-risk-medium"></div> Medium</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-risk-high"></div> High</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Intervention Success Trend */}
                    <Card className="lg:col-span-3 border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Intervention Success Trend (6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={successTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis domain={[50, 100]} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="rate" name="Success Rate %" stroke="#8b5cf6" strokeWidth={3} dot={{r:4}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
