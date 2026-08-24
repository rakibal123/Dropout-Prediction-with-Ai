"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    ArrowUpRight,
    Check,
    X,
    Send,
    UserCheck,
    FileText,
    ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

interface Student {
    name: string;
    id: string;
    email: string;
    risk: "High" | "Medium" | "Low";
    gpa: number;
    attendance: string;
    lastActive: string;
}

export default function TeacherDashboard() {
    const router = useRouter();
    const { showToast } = useToast();

    // Initial student state
    const [studentsList, setStudentsList] = useState<Student[]>([
        { name: "Arifa Sultana", id: "S101", email: "arifa.sultana@university.edu", risk: "High", gpa: 2.1, attendance: "65%", lastActive: "3 days ago" },
        { name: "Tanvirul Islam", id: "S102", email: "tanvirul.islam@university.edu", risk: "Medium", gpa: 2.8, attendance: "82%", lastActive: "Yesterday" },
        { name: "Nusrat Jahan", id: "S103", email: "nusrat.jahan@university.edu", risk: "Low", gpa: 3.5, attendance: "95%", lastActive: "Today" },
        { name: "Mehedi Hasan", id: "S104", email: "mehedi.hasan@university.edu", risk: "Low", gpa: 3.9, attendance: "98%", lastActive: "2 hours ago" },
        { name: "Rokeya Begum", id: "S105", email: "rokeya.begum@university.edu", risk: "High", gpa: 1.9, attendance: "58%", lastActive: "1 week ago" },
    ]);

    // UI Interactive States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRisk, setSelectedRisk] = useState<string>("All");
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

    // Email Modal State
    const [selectedStudentForMail, setSelectedStudentForMail] = useState<Student | null>(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Stats calculations
    const highRiskCount = studentsList.filter(s => s.risk === "High").length;

    const stats = [
        { label: "Total Students", value: studentsList.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100", riskFilter: "All" },
        { label: "At Risk (High)", value: highRiskCount.toString(), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", riskFilter: "High" },
        { label: "Avg. Attendance", value: "88%", icon: Calendar, color: "text-purple-600", bg: "bg-purple-100", riskFilter: "All" },
        { label: "Class Performance", value: "+4.2%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", riskFilter: "All" },
    ];

    // Filter students by Search and Risk level
    const filteredStudents = studentsList.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = selectedRisk === "All" || student.risk === selectedRisk;
        return matchesSearch && matchesRisk;
    });

    // Handle CSV Export
    const handleExportReport = () => {
        setIsExporting(true);
        showToast("Generating CS101 Class Report...", "info");

        setTimeout(() => {
            const csvContent =
                "data:text/csv;charset=utf-8," +
                ["Student ID,Name,Email,Risk Level,GPA,Attendance,Last Active"]
                    .concat(
                        studentsList.map(
                            (s) => `${s.id},${s.name},${s.email},${s.risk},${s.gpa},${s.attendance},${s.lastActive}`
                        )
                    )
                    .join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "CS101_Class_Risk_Report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsExporting(false);
            showToast("Class Report exported successfully!", "success");
        }, 1200);
    };

    // Open email modal for specific student
    const openMailModal = (student: Student) => {
        setSelectedStudentForMail(student);
        setEmailSubject(`Academic Check-in: CS101 - ${student.name}`);
        setEmailBody(
            `Dear ${student.name},\n\nI am reaching out regarding your progress in CS101. Please let me know when you are available for a brief meeting.\n\nBest regards,\nCourse Instructor`
        );
        setActiveActionMenuId(null);
    };

    // Handle Send Email
    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForMail) return;

        setIsSendingEmail(true);
        setTimeout(() => {
            setIsSendingEmail(false);
            showToast(`Email sent successfully to ${selectedStudentForMail.name}!`, "success");
            setSelectedStudentForMail(null);
        }, 1000);
    };

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Class Overview: CS101 - Spring 2026</h1>
                        <p className="text-muted-foreground">Monitor student engagement and identify potential dropouts.</p>
                    </div>
                    <div className="flex gap-2 relative">
                        {/* Filter Dropdown Toggle */}
                        <div className="relative">
                            <Button
                                variant={selectedRisk !== "All" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                className="transition-all"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter: {selectedRisk}
                            </Button>

                            <AnimatePresence>
                                {isFilterDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-2 space-y-1"
                                    >
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1">Filter by Risk</p>
                                        {["All", "High", "Medium", "Low"].map((risk) => (
                                            <button
                                                key={risk}
                                                onClick={() => {
                                                    setSelectedRisk(risk);
                                                    setIsFilterDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between font-medium transition-colors ${
                                                    selectedRisk === risk
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "hover:bg-secondary text-foreground"
                                                }`}
                                            >
                                                <span>{risk} Risk</span>
                                                {selectedRisk === risk && <Check className="h-3.5 w-3.5 text-primary" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Export Report Button */}
                        <Button size="sm" onClick={handleExportReport} isLoading={isExporting}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Grid - Clickable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedRisk(stat.riskFilter)}
                            className="cursor-pointer"
                        >
                            <Card className={`border-2 transition-all hover:scale-[1.02] shadow-sm ${
                                selectedRisk === stat.riskFilter && stat.riskFilter !== "All"
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent hover:border-border"
                            }`}>
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
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-card pb-4 gap-3">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Student Risk Assessment</CardTitle>
                                {selectedRisk !== "All" && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                        {selectedRisk} Risk Only
                                    </span>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
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
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                                                No students found matching "{searchTerm || selectedRisk}".
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
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
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        student.risk === "High"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            : student.risk === "Medium"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    }`}>
                                                        {student.risk}
                                                    </span>
                                                </td>
                                                <td className="p-4 px-6">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium">GPA: <span className="font-bold">{student.gpa}</span></p>
                                                        <div className="h-1.5 w-24 rounded-full bg-secondary">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    student.attendance.startsWith('9')
                                                                        ? 'bg-emerald-500'
                                                                        : student.attendance.startsWith('8')
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                }`}
                                                                style={{ width: student.attendance }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6 text-xs text-muted-foreground font-medium">
                                                    {student.lastActive}
                                                </td>
                                                <td className="p-4 px-6 text-right relative">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Send Email Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={`Send email to ${student.name}`}
                                                            onClick={() => openMailModal(student)}
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>

                                                        {/* Action Dropdown Menu */}
                                                        <div className="relative">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setActiveActionMenuId(
                                                                        activeActionMenuId === student.id ? null : student.id
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0 rounded-full hover:bg-secondary"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>

                                                            <AnimatePresence>
                                                                {activeActionMenuId === student.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                                        className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-xl z-50 p-1 text-left"
                                                                    >
                                                                        <button
                                                                            onClick={() => {
                                                                                setActiveActionMenuId(null);
                                                                                router.push(`/dashboard/teacher/students?id=${student.id}`);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-secondary flex items-center gap-2"
                                                                        >
                                                                            <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                                            View Profile
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openMailModal(student)}
                                                                            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-secondary flex items-center gap-2"
                                                                        >
                                                                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                                                                            Send Email
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setActiveActionMenuId(null);
                                                                                router.push(`/dashboard/teacher/interventions?studentId=${student.id}`);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-secondary flex items-center gap-2 text-red-500 font-medium"
                                                                        >
                                                                            <ShieldAlert className="h-3.5 w-3.5" />
                                                                            Log Intervention
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="p-4 bg-secondary/10 border-t border-border flex justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/teacher/students")}
                                    className="text-sm text-muted-foreground hover:text-primary font-semibold"
                                >
                                    View Full Class List →
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: AI Analytics & Quick Link */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden relative">
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
                                <Button
                                    onClick={() => router.push("/dashboard/teacher/analytics")}
                                    className="w-full bg-white text-slate-900 hover:bg-slate-200 mt-2 h-10 font-bold transition-all"
                                >
                                    Detailed AI Analytics
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Interactive Email Modal */}
            <AnimatePresence>
                {selectedStudentForMail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                                <div>
                                    <h3 className="font-bold text-lg">Send Direct Message</h3>
                                    <p className="text-xs text-muted-foreground">To: {selectedStudentForMail.name} ({selectedStudentForMail.email})</p>
                                </div>
                                <button
                                    onClick={() => setSelectedStudentForMail(null)}
                                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                                    <Input
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Subject"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Message</label>
                                    <textarea
                                        rows={5}
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedStudentForMail(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" isLoading={isSendingEmail}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Message
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
