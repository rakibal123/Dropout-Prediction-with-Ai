"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Users, AlertTriangle, Search, Mail, Filter, BarChart3,
    ArrowUpRight, Check, X, Send, UserCheck, ShieldAlert,
    ArrowLeft, Upload, FileDown, Plus, FileSpreadsheet,
    Activity, Clock, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

// Interfaces
interface Semester { _id: string; name: string; }
interface Course { _id: string; code: string; name: string; }
interface TeachingCourse { course: Course; studentsCount: number; assessedCount: number; }
interface MyTeachingSemester { semester: Semester; courses: TeachingCourse[]; }
interface StudentRecord {
    student: { _id: string; fullName: string; email: string; rollNumber: string; registrationNumber: string; department?: string; };
    dataStatus: "Available" | "Pending";
    riskLevel: "High" | "Medium" | "Low" | "No Data";
    data: any;
}

export default function TeacherDashboard() {
    const router = useRouter();
    const { showToast } = useToast();

    // Course Selection State
    const [myTeaching, setMyTeaching] = useState<MyTeachingSemester[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourseInfo, setSelectedCourseInfo] = useState<{ course: Course, semester: Semester } | null>(null);

    // Selected Course State
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRisk, setSelectedRisk] = useState<string>("All");
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    // UI Interactive States
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
    const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentRecord | null>(null);
    
    // Manual Data Entry State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [selectedStudentForManual, setSelectedStudentForManual] = useState<StudentRecord | null>(null);
    const [manualForm, setManualForm] = useState<any>({
        attendancePercentage: '', assignmentSubmissionRate: '', quizAverage: '',
        ctMarks: '', midtermMarks: '', finalMarks: '', studyHoursPerWeek: '',
        classEngagement: '', participationInActivities: '', missedAssessments: ''
    });
    const [isSubmittingData, setIsSubmittingData] = useState(false);
    
    // Bulk Upload State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMyTeaching();
    }, []);

    const fetchMyTeaching = async () => {
        setLoadingCourses(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teacher/my-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMyTeaching(data.data.myTeaching);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load your courses", "error");
        } finally {
            setLoadingCourses(false);
        }
    };

    const selectCourse = (course: Course, semester: Semester) => {
        setSelectedCourseInfo({ course, semester });
        fetchStudents(course._id, semester._id);
    };

    const fetchStudents = async (courseId: string, semesterId: string) => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teacher/courses/${courseId}/students?semesterId=${semesterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStudents(data.data.students);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load students", "error");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseInfo || !selectedStudentForManual) return;
        setIsSubmittingData(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                semesterId: selectedCourseInfo.semester._id,
                studentId: selectedStudentForManual.student._id,
                ...manualForm
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teacher/courses/${selectedCourseInfo.course._id}/manual-upload`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Data saved successfully!", "success");
                setIsManualModalOpen(false);
                fetchStudents(selectedCourseInfo.course._id, selectedCourseInfo.semester._id);
                fetchMyTeaching(); // Refresh counts
            } else {
                showToast(data.message || "Failed to save data", "error");
            }
        } catch (error) {
            showToast("Connection error", "error");
        } finally {
            setIsSubmittingData(false);
        }
    };

    const downloadTemplate = async () => {
        if (!selectedCourseInfo) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teacher/courses/${selectedCourseInfo.course._id}/template?semesterId=${selectedCourseInfo.semester._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedCourseInfo.course.code}_Template.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            showToast("Failed to download template", "error");
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile || !selectedCourseInfo) return;
        setIsUploading(true);
        setUploadResult(null);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('semesterId', selectedCourseInfo.semester._id);
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teacher/courses/${selectedCourseInfo.course._id}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUploadResult(data.data);
                fetchStudents(selectedCourseInfo.course._id, selectedCourseInfo.semester._id);
                fetchMyTeaching(); // Refresh counts
            } else {
                showToast(data.message || "Upload failed", "error");
            }
        } catch (error) {
            showToast("Upload failed", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredStudents = students.filter((s) => {
        const matchesSearch =
            s.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = selectedRisk === "All" || s.riskLevel === selectedRisk;
        return matchesSearch && matchesRisk;
    });

    const highRiskCount = students.filter(s => s.riskLevel === "High").length;
    const assessedCount = students.filter(s => s.dataStatus === "Available").length;

    // View 1: Course Selection
    if (!selectedCourseInfo) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex flex-col gap-8 p-4 md:p-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Teaching</h1>
                        <p className="text-muted-foreground mt-2">Select a course to view students and manage assessments.</p>
                    </div>

                    {loadingCourses ? (
                        <div className="flex justify-center py-20">
                            <Activity className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    ) : myTeaching.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border bg-secondary/20">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold">No courses assigned yet.</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                You currently don't have any courses assigned to you for this semester. Contact the administrator if this is a mistake.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {myTeaching.map(sem => (
                                <div key={sem.semester._id} className="space-y-4">
                                    <h2 className="text-xl font-semibold border-b border-border pb-2">{sem.semester.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sem.courses.map(c => (
                                            <Card 
                                                key={c.course._id} 
                                                onClick={() => selectCourse(c.course, sem.semester)}
                                                className="cursor-pointer hover:border-primary transition-all hover:shadow-md group border-2"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="group-hover:text-primary transition-colors text-lg">{c.course.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground font-mono bg-secondary/50 inline-block px-2 py-1 rounded w-max mt-1">{c.course.code}</p>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-between items-center text-sm mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{c.studentsCount} Enrolled</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FileDown className="h-4 w-4 text-muted-foreground" />
                                                            <span className={`${c.assessedCount === c.studentsCount && c.studentsCount > 0 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}`}>
                                                                {c.assessedCount} Assessed
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${c.assessedCount === c.studentsCount && c.studentsCount > 0 ? "bg-emerald-500" : "bg-primary"}`} 
                                                            style={{ width: `${c.studentsCount > 0 ? (c.assessedCount / c.studentsCount) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        );
    }

    // View 2: Course Details
    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6 p-2 md:p-4">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button 
                            onClick={() => setSelectedCourseInfo(null)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Courses
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight">{selectedCourseInfo.course.name}</h1>
                        <p className="text-muted-foreground font-mono">{selectedCourseInfo.course.code} • {selectedCourseInfo.semester.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                        </Button>
                        <Button size="sm" onClick={() => { setManualForm({}); setSelectedStudentForManual(null); setIsManualModalOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Student Data
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 shrink-0`}>
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Enrolled</p>
                                <p className="text-xl font-bold">{students.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedRisk("All")}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 shrink-0`}>
                                <FileDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Assessed</p>
                                <p className="text-xl font-bold">{assessedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600 shrink-0`}>
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                                <p className="text-xl font-bold">{students.length - assessedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border cursor-pointer hover:border-red-500 transition-colors" onClick={() => setSelectedRisk("High")}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-red-100 text-red-600 shrink-0`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">High Risk</p>
                                <p className="text-xl font-bold">{highRiskCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Student List */}
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-card pb-4 gap-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Class Roster & Risk</CardTitle>
                            {selectedRisk !== "All" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1">
                                    {selectedRisk} Risk
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRisk("All")} />
                                </span>
                            )}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or roll..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 overflow-x-auto">
                        {loadingStudents ? (
                            <div className="flex justify-center py-12">
                                <Activity className="h-6 w-6 text-primary animate-spin" />
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30">
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Status</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Level</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Metrics</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s) => (
                                            <tr key={s.student._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                            {s.student.fullName ? s.student.fullName.charAt(0).toUpperCase() : "?"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{s.student.fullName}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">{s.student.rollNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6">
                                                    {s.dataStatus === "Available" ? (
                                                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md font-medium">Available</span>
                                                    ) : (
                                                        <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-medium">Pending</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        s.riskLevel === "High" ? "bg-red-100 text-red-700" :
                                                        s.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" :
                                                        s.riskLevel === "Low" ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-secondary text-muted-foreground"
                                                    }`}>
                                                        {s.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="p-4 px-6">
                                                    {s.data ? (
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="font-medium">Att:</span> {s.data.attendancePercentage}% | <span className="font-medium">Mid:</span> {s.data.midtermMarks}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 text-right relative">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setSelectedStudentForManual(s); setManualForm(s.data || {}); setIsManualModalOpen(true); }}
                                                            className="h-8 text-xs px-2 text-primary"
                                                        >
                                                            {s.dataStatus === "Available" ? "Edit Data" : "Add Data"}
                                                        </Button>
                                                        <div className="relative">
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                onClick={() => setActiveActionMenuId(activeActionMenuId === s.student._id ? null : s.student._id)}
                                                                className="h-8 w-8 p-0 rounded-full hover:bg-secondary"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                            <AnimatePresence>
                                                                {activeActionMenuId === s.student._id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                                        className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-xl z-50 p-1 text-left"
                                                                    >
                                                                        <button onClick={() => { setActiveActionMenuId(null); setSelectedStudentForProfile(s); }} className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-secondary flex items-center gap-2">
                                                                            <UserCheck className="h-3.5 w-3.5 text-primary" /> View Profile
                                                                        </button>
                                                                        <button onClick={() => { setActiveActionMenuId(null); router.push(`/dashboard/teacher/interventions?studentId=${s.student._id}`); }} className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-secondary flex items-center gap-2 text-red-500 font-medium">
                                                                            <ShieldAlert className="h-3.5 w-3.5" /> Log Intervention
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedStudentForProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                                <div><h3 className="font-bold text-lg">Student Profile</h3></div>
                                <button onClick={() => setSelectedStudentForProfile(null)} className="p-1 rounded-lg hover:bg-secondary">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                                        {selectedStudentForProfile.student.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold">{selectedStudentForProfile.student.fullName}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail className="h-3.5 w-3.5" /> {selectedStudentForProfile.student.email}</p>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 bg-secondary/20 p-3 rounded-lg border border-border/40 text-xs">
                                            <div><span className="text-muted-foreground block font-medium">Roll No</span><span className="font-bold">{selectedStudentForProfile.student.rollNumber}</span></div>
                                            <div><span className="text-muted-foreground block font-medium">Registration</span><span className="font-bold">{selectedStudentForProfile.student.registrationNumber}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Course Risk Status</p>
                                    <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                                        selectedStudentForProfile.riskLevel === "High" ? "bg-red-500/10 border-red-500/20 text-red-500"
                                        : selectedStudentForProfile.riskLevel === "Medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                        : selectedStudentForProfile.riskLevel === "Low" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                        : "bg-secondary text-muted-foreground"
                                    }`}>
                                        <ShieldAlert className="h-6 w-6" />
                                        <div>
                                            <p className="font-bold">{selectedStudentForProfile.riskLevel} Risk</p>
                                            <p className="text-xs opacity-80">{selectedStudentForProfile.dataStatus === "Available" ? "Calculated from uploaded data." : "No assessment data available."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Data Modal */}
            <AnimatePresence>
                {isManualModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedStudentForManual ? 'Edit Data' : 'Add Student Data'}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedStudentForManual?.student.fullName} • {selectedCourseInfo?.course.code}</p>
                                </div>
                                <button onClick={() => setIsManualModalOpen(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleManualSubmit} className="p-6 space-y-4 overflow-y-auto">
                                {!selectedStudentForManual && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Select Student</label>
                                        <select 
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            onChange={(e) => setSelectedStudentForManual(students.find(s => s.student._id === e.target.value) || null)}
                                            required
                                        >
                                            <option value="">Select a student...</option>
                                            {students.map(s => (
                                                <option key={s.student._id} value={s.student._id}>{s.student.fullName} ({s.student.rollNumber})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Attendance (%)</label><Input type="number" min="0" max="100" value={manualForm.attendancePercentage} onChange={e => setManualForm({...manualForm, attendancePercentage: e.target.value})} required /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Assignment Submission (%)</label><Input type="number" min="0" max="100" value={manualForm.assignmentSubmissionRate} onChange={e => setManualForm({...manualForm, assignmentSubmissionRate: e.target.value})} required /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Quiz Average</label><Input type="number" min="0" max="100" value={manualForm.quizAverage} onChange={e => setManualForm({...manualForm, quizAverage: e.target.value})} required /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">CT Marks</label><Input type="number" min="0" max="100" value={manualForm.ctMarks} onChange={e => setManualForm({...manualForm, ctMarks: e.target.value})} required /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Midterm Marks</label><Input type="number" min="0" max="100" value={manualForm.midtermMarks} onChange={e => setManualForm({...manualForm, midtermMarks: e.target.value})} required /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Final Marks</label><Input type="number" min="0" max="100" value={manualForm.finalMarks} onChange={e => setManualForm({...manualForm, finalMarks: e.target.value})} /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Study Hours/Week</label><Input type="number" min="0" max="168" value={manualForm.studyHoursPerWeek} onChange={e => setManualForm({...manualForm, studyHoursPerWeek: e.target.value})} /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Class Engagement (0-100)</label><Input type="number" min="0" max="100" value={manualForm.classEngagement} onChange={e => setManualForm({...manualForm, classEngagement: e.target.value})} /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Participation (0-100)</label><Input type="number" min="0" max="100" value={manualForm.participationInActivities} onChange={e => setManualForm({...manualForm, participationInActivities: e.target.value})} /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-semibold">Missed Assessments</label><Input type="number" min="0" value={manualForm.missedAssessments} onChange={e => setManualForm({...manualForm, missedAssessments: e.target.value})} /></div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-border mt-6">
                                    <Button type="submit" isLoading={isSubmittingData}>Save & Calculate Risk</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {isBulkModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                                <h3 className="font-bold text-lg">Bulk Data Upload</h3>
                                <button onClick={() => { setIsBulkModalOpen(false); setUploadResult(null); }} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                {!uploadResult ? (
                                    <>
                                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4">
                                            <FileSpreadsheet className="h-8 w-8 text-primary shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-primary">1. Download Template</p>
                                                <p className="text-xs text-primary/80 mb-2">Get the pre-filled Excel template for {selectedCourseInfo?.course.code}.</p>
                                                <Button size="sm" variant="outline" className="h-8 text-xs bg-card" onClick={downloadTemplate}>
                                                    <FileDown className="mr-2 h-3.5 w-3.5" /> Download Excel
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="bg-secondary/20 border border-border rounded-xl p-4 flex gap-4">
                                            <Upload className="h-8 w-8 text-muted-foreground shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">2. Upload Filled Template</p>
                                                <p className="text-xs text-muted-foreground mb-2">Select your completed file to upload.</p>
                                                <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && setUploadFile(e.target.files[0])} />
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()}>Choose File</Button>
                                                    <span className="text-xs text-muted-foreground">{uploadFile ? uploadFile.name : 'No file chosen'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full" disabled={!uploadFile} isLoading={isUploading} onClick={handleFileUpload}>Upload & Process</Button>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                            <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="font-bold text-emerald-600">Upload Processed</p>
                                            <p className="text-sm text-emerald-600/80">Successfully imported {uploadResult.valid} records.</p>
                                        </div>
                                        {uploadResult.invalid > 0 && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                                <p className="text-sm font-bold text-red-600 mb-2">{uploadResult.invalid} Rows Rejected</p>
                                                <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                                                    {uploadResult.errors.map((err: any, i: number) => (
                                                        <p key={i} className="text-red-500 font-mono">Row {err.row}: {err.message}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <Button className="w-full" onClick={() => { setIsBulkModalOpen(false); setUploadResult(null); setUploadFile(null); }}>Done</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </DashboardLayout>
    );
}
