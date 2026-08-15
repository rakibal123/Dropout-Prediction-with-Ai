"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, AlertTriangle, CheckCircle, Clock, MoreVertical, Filter, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function TeacherInterventionsPage() {
    const [interventions, setInterventions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterventions();
    }, []);

    const fetchInterventions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/recommendations`, {
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

    const overdueCount = interventions.filter(i => new Date(i.dueDate) < new Date() && i.status !== 'Completed').length;
    const pendingCount = interventions.filter(i => i.status !== 'Completed').length;
    const completedCount = interventions.filter(i => i.status === 'Completed').length;

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Intervention Center</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage AI-generated academic intervention plans for your students.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm bg-amber-500/10 border border-amber-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600/80">Pending Interventions</p>
                                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-red-500/10 border border-red-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-red-500/20 text-red-600 shrink-0">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-600/80">Overdue Recommendations</p>
                                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-green-500/10 border border-green-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-600 shrink-0">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-600/80">Completed Plans</p>
                                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-card pb-4">
                        <CardTitle className="text-lg">Students Requiring Intervention</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative w-48 sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search students..." className="pl-9 h-9" />
                            </div>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="h-4 w-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                                    <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Level & Priority</th>
                                    <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Status</th>
                                    <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</th>
                                    <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading interventions...</td>
                                    </tr>
                                ) : interventions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No interventions found.</td>
                                    </tr>
                                ) : (
                                    interventions.map((rec) => (
                                        <tr key={rec._id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                        {rec.studentId?.fullName?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{rec.studentId?.fullName || 'Unknown Student'}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">{rec.studentId?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                        rec.riskLevel === 'High' ? 'bg-red-500/10 text-red-500' :
                                                        rec.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                                                    }`}>{rec.riskLevel} Risk</span>
                                                    
                                                    {rec.priority === 'Critical' && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><AlertTriangle className="w-3 h-3"/> Critical Priority</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        rec.status === 'Completed' ? 'bg-green-500' : 
                                                        rec.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                                                    }`}></div>
                                                    <span className="text-sm font-medium">{rec.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className={`text-sm font-medium ${new Date(rec.dueDate) < new Date() && rec.status !== 'Completed' ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                    {new Date(rec.dueDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 text-right">
                                                <Button variant="outline" size="sm" className="mr-2">Manage</Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
