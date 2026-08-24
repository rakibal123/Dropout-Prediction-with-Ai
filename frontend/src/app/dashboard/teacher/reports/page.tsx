"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { 
    AlertTriangle, Download, FileText, Filter, CheckCircle2, TrendingDown, RefreshCw
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function TeacherReportsPage() {
    const { showToast } = useToast();

    const reports = [
        { id: "1", title: "High Dropout Risk Cohort Summary", date: "Aug 24, 2026", totalFlagged: 12, department: "Computer Science", status: "Action Required" },
        { id: "2", title: "Mid-Term Attendance Deficit Report", date: "Aug 18, 2026", totalFlagged: 8, department: "Computer Science", status: "Under Review" },
        { id: "3", title: "Assignment Non-Submission Warning", date: "Aug 10, 2026", totalFlagged: 15, department: "Software Engineering", status: "Resolved" },
    ];

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Academic Risk Reports</h1>
                        <p className="text-muted-foreground">Comprehensive risk reports generated from student behavior & ML predictions.</p>
                    </div>
                    <Button variant="primary" onClick={() => showToast("Exporting risk report summary...", "success")}>
                        <Download className="h-4 w-4 mr-2" /> Download Full Report PDF
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-premium bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">High Risk Students</p>
                                <h3 className="text-3xl font-black mt-1 text-rose-500">12</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requires immediate intervention</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medium Risk Students</p>
                                <h3 className="text-3xl font-black mt-1 text-amber-500">24</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requires weekly monitoring</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Interventions</p>
                                <h3 className="text-3xl font-black mt-1 text-emerald-500">18</h3>
                                <p className="text-xs text-muted-foreground mt-1">In-progress support plans</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-premium bg-card overflow-hidden">
                    <CardHeader className="border-b border-border bg-card/50 px-6 py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" /> Generated Risk Audits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {reports.map((r) => (
                                <div key={r.id} className="p-4 px-6 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">{r.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">{r.department} • Generated on {r.date} • {r.totalFlagged} Students Flagged</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            r.status === 'Action Required' ? 'bg-rose-500/10 text-rose-400' :
                                            r.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                            {r.status}
                                        </span>
                                        <Button variant="outline" size="sm" onClick={() => showToast(`Opening ${r.title}...`, "info")}>
                                            View Report
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
