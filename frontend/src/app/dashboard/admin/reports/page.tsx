"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Users, TrendingUp, ShieldAlert, School } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function ReportsPage() {
    const { showToast } = useToast();

    const handleExportCSV = (reportName: string) => {
        // Mock CSV Export
        const csvContent = "data:text/csv;charset=utf-8,Report Data Placeholder\nData 1,Data 2";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportName.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Successfully generated ${reportName} (CSV)`, "success");
    };

    const handleExportPDF = () => {
        window.print();
        showToast("Generating PDF Report. Please use the print dialog to save.", "success");
    };

    const reports = [
        {
            title: "Student Roster Report",
            description: "Complete list of all registered students, their departments, semesters, and current system status.",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Prediction History Report",
            description: "Log of all ML and rule-based risk predictions generated within the selected timeframe.",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Global Risk Analysis",
            description: "Aggregate statistics of student risk levels, highlighting critical and high-risk individuals.",
            icon: ShieldAlert,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Department Performance",
            description: "Comparative analytics of academic performance and behavioral engagement across all departments.",
            icon: School,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Reports</h1>
                        <p className="text-muted-foreground">Generate and export system-wide analytics and data records.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report, i) => (
                        <motion.div
                            key={report.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-premium bg-card h-full flex flex-col">
                                <CardHeader className="flex flex-row gap-4 items-start pb-2">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${report.bg} ${report.color}`}>
                                        <report.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{report.title}</CardTitle>
                                        <CardDescription className="mt-1">{report.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto pt-4 flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleExportCSV(report.title)}>
                                        <Download className="mr-2 h-4 w-4" /> CSV
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleExportCSV(report.title)}>
                                        <Download className="mr-2 h-4 w-4" /> Excel
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={handleExportPDF}>
                                        <FileText className="mr-2 h-4 w-4" /> PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
