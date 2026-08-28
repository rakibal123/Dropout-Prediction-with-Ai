"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Users, AlertTriangle, Search, Check, X,
    ArrowLeft, Upload, FileDown, Plus, FileSpreadsheet,
    Activity, Clock, MoreVertical, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import * as xlsx from 'xlsx';

interface StudentRecord {
    student: { _id: string; fullName: string; email: string; rollNumber: string; registrationNumber: string; };
    dataStatus: "Available" | "Pending";
    riskLevel: "High" | "Medium" | "Low" | "No Data" | "Pending";
    data: any;
}
const DEMO_STUDENTS = [
    {
        _id: "demo-001",
        fullName: "Arif Hasan",
        email: "arif.demo@university.edu",
        rollNumber: "DEMO-001",
        registrationNumber: "DEMO-REG-001",
        demoData: {
            attendancePercentage: 45, assignmentSubmissionRate: 40, quizAverage: 42,
            ctMarks: 40, midtermMarks: 42, finalMarks: 40, studyHoursPerWeek: 4,
            classEngagement: 30, participationInActivities: 35, missedAssessments: 3
        }
    },
    {
        _id: "demo-002",
        fullName: "Nusrat Jahan",
        email: "nusrat.demo@university.edu",
        rollNumber: "DEMO-002",
        registrationNumber: "DEMO-REG-002",
        demoData: {
            attendancePercentage: 68, assignmentSubmissionRate: 65, quizAverage: 62,
            ctMarks: 60, midtermMarks: 62, finalMarks: 60, studyHoursPerWeek: 8,
            classEngagement: 60, participationInActivities: 65, missedAssessments: 1
        }
    },
    {
        _id: "demo-003",
        fullName: "Tanvir Ahmed",
        email: "tanvir.demo@university.edu",
        rollNumber: "DEMO-003",
        registrationNumber: "DEMO-REG-003",
        demoData: {
            attendancePercentage: 82, assignmentSubmissionRate: 78, quizAverage: 75,
            ctMarks: 75, midtermMarks: 78, finalMarks: 75, studyHoursPerWeek: 11,
            classEngagement: 80, participationInActivities: 82, missedAssessments: 0
        }
    },
    {
        _id: "demo-004",
        fullName: "Sadia Rahman",
        email: "sadia.demo@university.edu",
        rollNumber: "DEMO-004",
        registrationNumber: "DEMO-REG-004",
        demoData: {
            attendancePercentage: 93, assignmentSubmissionRate: 90, quizAverage: 88,
            ctMarks: 88, midtermMarks: 90, finalMarks: 93, studyHoursPerWeek: 15,
            classEngagement: 95, participationInActivities: 90, missedAssessments: 0
        }
    },
    {
        _id: "demo-005",
        fullName: "Rakibul Islam",
        email: "rakibul.demo@university.edu",
        rollNumber: "DEMO-005",
        registrationNumber: "DEMO-REG-005",
        demoData: {
            attendancePercentage: 55, assignmentSubmissionRate: 52, quizAverage: 50,
            ctMarks: 50, midtermMarks: 52, finalMarks: 50, studyHoursPerWeek: 6,
            classEngagement: 45, participationInActivities: 50, missedAssessments: 2
        }
    }
];

export default function CourseDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { showToast } = useToast();

    const courseId = params.courseId as string;
    const semesterId = searchParams.get('semesterId');
    const semesterName = searchParams.get('semesterName') || '';
    const courseName = searchParams.get('courseName') || 'Course Details';
    const courseCode = searchParams.get('courseCode') || '';

    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRisk, setSelectedRisk] = useState<string>("All");

    // UI Interactive States
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

    // Manual Data Entry State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [selectedStudentForManual, setSelectedStudentForManual] = useState<StudentRecord | null>(null);
    const [manualForm, setManualForm] = useState<any>({
        attendancePercentage: '', assignmentSubmissionRate: '', quizAverage: '',
        ctMarks: '', midtermMarks: '', finalMarks: '', studyHoursPerWeek: '',
        classEngagement: '', participationInActivities: '', missedAssessments: ''
    });
    const [isSubmittingData, setIsSubmittingData] = useState(false);
    const [predictionResult, setPredictionResult] = useState<any>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    // Bulk Upload State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [previewStats, setPreviewStats] = useState({ total: 0, valid: 0, invalid: 0 });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!courseId || !semesterId) {
            router.push('/dashboard/teacher');
            return;
        }
        fetchStudents();
    }, [courseId, semesterId]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/teacher/courses/${courseId}/students?semesterId=${semesterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStudents(data.data.students);
            } else {
                showToast(data.message || "Failed to load students", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Connection error", "error");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handlePredictPreview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForManual) return;
        setIsPredicting(true);
        setPredictionResult(null);
        try {
            const token = localStorage.getItem("token");
            const payload: any = {
                semesterId,
                ...manualForm
            };
            const res = await fetch(`/api/teacher/courses/${courseId}/predict-preview`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setPredictionResult(data.data);
                showToast("Prediction completed.", "success");
            } else {
                showToast(data.message || "Failed to predict risk", "error");
            }
        } catch (error) {
            showToast("Connection error", "error");
        } finally {
            setIsPredicting(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!selectedStudentForManual) return;
        setIsSubmittingData(true);
        try {
            const token = localStorage.getItem("token");
            const isDemo = selectedStudentForManual.student.rollNumber.startsWith('DEMO-');
            const payload: any = {
                semesterId,
                ...manualForm
            };
            
            if (isDemo) {
                payload.isDemo = true;
                payload.demoStudentName = selectedStudentForManual.student.fullName;
                payload.demoStudentRoll = selectedStudentForManual.student.rollNumber;
            } else {
                payload.studentId = selectedStudentForManual.student._id;
            }
            const res = await fetch(`/api/teacher/courses/${courseId}/manual-upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Assessment data saved successfully.", "success");
                setIsManualModalOpen(false);
                setPredictionResult(null);
                fetchStudents();
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
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/teacher/courses/${courseId}/template?semesterId=${semesterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                showToast(errorData.message || "Failed to download template", "error");
                return;
            }
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${courseCode}_Template.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showToast("Failed to download template", "error");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadFile(file);
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = xlsx.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = xlsx.utils.sheet_to_json(ws);
                
                let valid = 0;
                let invalid = 0;
                const previewRows = data.map((row: any, i) => {
                    const roll = String(row['Roll Number']).trim();
                    const studentEnrolled = students.find(s => s.student.rollNumber === roll);
                    let status = "Valid";
                    if (!studentEnrolled) {
                        status = "Invalid: Not enrolled";
                        invalid++;
                    } else if (Number(row['Attendance (%)']) < 0 || Number(row['Attendance (%)']) > 100) {
                        status = "Invalid: Attendance out of range";
                        invalid++;
                    } else {
                        valid++;
                    }
                    return {
                        rowNum: i + 2,
                        roll,
                        attendance: row['Attendance (%)'],
                        ct: row['CT Marks (Out of 100)'],
                        assignment: row['Assignment Submission (%)'],
                        status,
                        isValid: status === "Valid"
                    };
                });
                setPreviewData(previewRows);
                setPreviewStats({ total: data.length, valid, invalid });
            } catch (err) {
                showToast("Could not parse Excel file", "error");
                setPreviewData(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleFileUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        setUploadResult(null);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('semesterId', semesterId!);

            const res = await fetch(`/api/teacher/courses/${courseId}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUploadResult(data.data);
                showToast("Assessment data saved successfully.", "success");
                fetchStudents();
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
    const mediumRiskCount = students.filter(s => s.riskLevel === "Medium").length;
    const lowRiskCount = students.filter(s => s.riskLevel === "Low").length;
    const assessedCount = students.filter(s => s.dataStatus === "Available").length;
    const pendingCount = students.length - assessedCount;

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <button
                            onClick={() => router.push('/dashboard/teacher')}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 px-2 py-1 -ml-2 rounded-md hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Courses
                        </button>
                        <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
                        <p className="text-muted-foreground font-mono mt-1">{courseCode} • {semesterName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => { fetchStudents(); showToast("Refreshing data...", "info"); }}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                        <Button variant="outline" onClick={downloadTemplate}>
                            <FileDown className="mr-2 h-4 w-4" /> Download Template
                        </Button>
                        <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Excel Upload
                        </Button>
                        <Button onClick={() => { setManualForm({}); setSelectedStudentForManual(null); setIsManualModalOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Manual Entry
                        </Button>
                    </div>
                </div>

                {/* Course Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="border-border">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-muted-foreground font-medium mb-1">Total Students</p>
                            <p className="text-2xl font-bold">{students.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-emerald-500/5">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-emerald-600 font-medium mb-1">Assessed</p>
                            <p className="text-2xl font-bold text-emerald-700">{assessedCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-amber-500/5">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-amber-600 font-medium mb-1">Pending</p>
                            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors" onClick={() => setSelectedRisk("High")}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-red-600 font-medium mb-1">High Risk</p>
                            <p className="text-2xl font-bold text-red-700">{highRiskCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors" onClick={() => setSelectedRisk("Medium")}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-amber-600 font-medium mb-1">Medium Risk</p>
                            <p className="text-2xl font-bold text-amber-700">{mediumRiskCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10 transition-colors" onClick={() => setSelectedRisk("Low")}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <p className="text-sm text-emerald-600 font-medium mb-1">Low Risk</p>
                            <p className="text-2xl font-bold text-emerald-700">{lowRiskCount}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Student List */}
                <Card className="border-none shadow-md overflow-hidden mt-2">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-card pb-4 gap-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Course Students</CardTitle>
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
                        ) : students.length === 0 ? (
                            <div className="p-16 text-center">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No students are enrolled in this course yet.</h3>
                                <p className="text-muted-foreground mt-2">You can still prepare your template or manual entry for when students enroll.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30">
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignment</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">CT</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Hrs</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk</th>
                                        <th className="p-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                                                No students found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s) => (
                                            <tr key={s.student._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4 px-6">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold">{s.student.fullName}</p>
                                                            {(s.student as any).isDemo ? (
                                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">DEMO</span>
                                                            ) : (
                                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">REAL</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{s.student.rollNumber} • {s.student.registrationNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6">
                                                    {s.dataStatus === "Available" ? (
                                                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md font-medium">Assessed</span>
                                                    ) : (
                                                        <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-medium">Pending</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 text-sm">{s.data ? `${s.data.attendancePercentage}%` : "—"}</td>
                                                <td className="p-4 px-6 text-sm">{s.data ? `${s.data.assignmentSubmissionRate}%` : "—"}</td>
                                                <td className="p-4 px-6 text-sm">{s.data ? s.data.ctMarks : "—"}</td>
                                                <td className="p-4 px-6 text-sm">{s.data ? `${s.data.studyHoursPerWeek} hrs` : "—"}</td>
                                                <td className="p-4 px-6">
                                                    {s.riskLevel === "No Data" ? (
                                                        <span className="text-xs text-muted-foreground">No Risk Data</span>
                                                    ) : (
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            s.riskLevel === "High" ? "bg-red-100 text-red-700" :
                                                            s.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" :
                                                            s.riskLevel === "Low" ? "bg-emerald-100 text-emerald-700" :
                                                            "bg-secondary text-muted-foreground"
                                                        }`}>
                                                            {s.riskLevel} Risk
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => { setSelectedStudentForManual(s); setManualForm(s.data || {}); setIsManualModalOpen(true); }}
                                                        className="h-8 text-xs px-2 text-primary border border-primary/20 hover:bg-primary/10"
                                                    >
                                                        [Edit]
                                                    </Button>
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
                                    <h3 className="font-bold text-lg">{selectedStudentForManual ? 'Edit Data' : 'Add Student Assessment Data'}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedStudentForManual?.student.fullName} • {courseCode}</p>
                                </div>
                                <button onClick={() => setIsManualModalOpen(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleManualSubmit} className="p-6 space-y-4 overflow-y-auto">
                                {!selectedStudentForManual && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Select Student</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPredictionResult(null); // Clear previous prediction
                                                if (val.startsWith("demo-")) {
                                                    const demoData = DEMO_STUDENTS.find(d => d._id === val);
                                                    if (demoData) {
                                                        const demoStudent = {
                                                            student: { _id: demoData._id, fullName: demoData.fullName, email: demoData.email, rollNumber: demoData.rollNumber, registrationNumber: demoData.registrationNumber },
                                                            dataStatus: "Pending" as const,
                                                            riskLevel: "Pending" as const,
                                                            data: demoData.demoData
                                                        };
                                                        setSelectedStudentForManual(demoStudent);
                                                        setManualForm(demoData.demoData as any);
                                                    }
                                                } else {
                                                    const existing = students.find(s => s.student._id === val);
                                                    if (existing) {
                                                        setSelectedStudentForManual(existing);
                                                        setManualForm(existing.data || {});
                                                    } else {
                                                        setSelectedStudentForManual(null);
                                                    }
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Select a student...</option>
                                            <optgroup label="REAL STUDENTS">
                                                {students.filter(s => !(s.student as any).isDemo).map(s => (
                                                    <option key={s.student._id} value={s.student._id}>{s.student.fullName} ({s.student.rollNumber})</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="DEMO STUDENTS">
                                                {DEMO_STUDENTS.map(s => (
                                                    <option key={s._id} value={s._id}>{s.fullName} ({s.rollNumber}) - Demo</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                )}
                                
                                {selectedStudentForManual && (selectedStudentForManual.student.rollNumber.startsWith('DEMO-')) && (
                                    <div className="flex justify-between items-center bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                                        <div>
                                            <p className="text-sm font-semibold text-purple-700">Demo Data — For ML Testing</p>
                                            <p className="text-xs text-purple-600/80">Values are pre-populated for testing the ML prediction model.</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-purple-700 border-purple-300 hover:bg-purple-100" onClick={() => {
                                            const demoData = DEMO_STUDENTS.find(d => d.rollNumber === selectedStudentForManual.student.rollNumber);
                                            if (demoData) {
                                                setManualForm(demoData.demoData as any);
                                                setPredictionResult(null);
                                            }
                                        }}>
                                            Reset Demo Values
                                        </Button>
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

                                {predictionResult && (
                                    <div className="bg-secondary/30 p-4 rounded-lg mt-4 border border-border">
                                        <h4 className="font-bold text-sm mb-2">Dropout Risk Prediction</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">Risk Level</p>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    predictionResult.riskLevel === "High" ? "bg-red-100 text-red-700" :
                                                    predictionResult.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" :
                                                    predictionResult.riskLevel === "Low" ? "bg-emerald-100 text-emerald-700" :
                                                    "bg-secondary text-muted-foreground"
                                                }`}>
                                                    {predictionResult.riskLevel} Risk
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">Prediction Probability</p>
                                                <p className="font-semibold text-sm">
                                                    {predictionResult.probability?.high ? (predictionResult.probability.high * 100).toFixed(1) : (predictionResult.confidence * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                        {predictionResult.topFactors && predictionResult.topFactors.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-1">Feature Contribution / SHAP</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {predictionResult.topFactors.map((f: any, idx: number) => (
                                                        <span key={idx} className="bg-background border border-border px-2 py-1 rounded text-[10px]">
                                                            {f.feature} ({f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {predictionResult.recommendation && (
                                            <div className="mt-3 bg-blue-500/10 text-blue-700 p-2 rounded text-xs">
                                                <span className="font-semibold">Recommended Intervention:</span> {predictionResult.recommendation}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                    {!predictionResult ? (
                                        <Button type="button" onClick={handlePredictPreview} isLoading={isPredicting}>Calculate Dropout Risk</Button>
                                    ) : (
                                        <>
                                            <Button type="button" variant="outline" onClick={() => setPredictionResult(null)}>Edit & Recalculate</Button>
                                            <Button type="button" onClick={handleManualSubmit} isLoading={isSubmittingData}>Save Assessment</Button>
                                        </>
                                    )}
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
                                <div>
                                    <h3 className="font-bold text-lg">Bulk Assessment Upload</h3>
                                    <p className="text-xs text-muted-foreground">Course: {courseName} ({courseCode}) • {semesterName}</p>
                                </div>
                                <button onClick={() => { setIsBulkModalOpen(false); setUploadResult(null); }} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                {!uploadResult ? (
                                    <>
                                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4 items-center">
                                            <FileDown className="h-8 w-8 text-primary shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-primary">Need the template?</p>
                                                <p className="text-xs text-primary/80">Download the required Excel format.</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-8 text-xs bg-card" onClick={downloadTemplate}>
                                                Download Template
                                            </Button>
                                        </div>

                                        <div className="bg-secondary/10 border border-border rounded-xl p-4 text-xs">
                                            <p className="font-semibold mb-2">Expected Excel Columns (Must exactly match):</p>
                                            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground list-disc pl-4">
                                                <li>Roll Number (Required)</li>
                                                <li>Student Name</li>
                                                <li>Attendance (%) (0-100)</li>
                                                <li>Assignment Submission (%) (0-100)</li>
                                                <li>Quiz Average (Out of 100)</li>
                                                <li>CT Marks (Out of 100)</li>
                                                <li>Midterm Marks (Out of 100)</li>
                                                <li>Final Marks (Out of 100)</li>
                                                <li>Study Hours Per Week (0-168)</li>
                                                <li>Class Engagement (0-100)</li>
                                                <li>Participation (0-100)</li>
                                                <li>Missed Assessments (Numeric)</li>
                                            </ul>
                                        </div>

                                        <div className="bg-secondary/20 border border-dashed border-border rounded-xl p-8 flex flex-col items-center text-center">
                                            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
                                            <p className="text-sm font-semibold mb-1">Drag & Drop Excel File</p>
                                            <p className="text-xs text-muted-foreground mb-4">or choose from your computer</p>
                                            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Choose Excel File</Button>
                                            
                                            {uploadFile && !previewData && (
                                                <div className="mt-4 p-2 bg-background border border-border rounded-md text-xs font-mono flex items-center gap-2">
                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                    {uploadFile.name}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {previewData && (
                                            <div className="border border-border rounded-xl overflow-hidden mt-4">
                                                <div className="bg-secondary/30 p-3 border-b border-border flex justify-between items-center text-xs">
                                                    <span className="font-bold">Upload Preview</span>
                                                    <div className="flex gap-3">
                                                        <span>Total: {previewStats.total}</span>
                                                        <span className="text-emerald-500 font-bold">Valid: {previewStats.valid}</span>
                                                        <span className={previewStats.invalid > 0 ? "text-red-500 font-bold" : ""}>Invalid: {previewStats.invalid}</span>
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-secondary/10 sticky top-0">
                                                            <tr>
                                                                <th className="p-2 pl-3">Row</th>
                                                                <th className="p-2">Roll</th>
                                                                <th className="p-2">Att.</th>
                                                                <th className="p-2">CT</th>
                                                                <th className="p-2">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {previewData.slice(0, 50).map((row: any, i: number) => (
                                                                <tr key={i} className={!row.isValid ? "bg-red-500/5" : ""}>
                                                                    <td className="p-2 pl-3 text-muted-foreground font-mono">{row.rowNum}</td>
                                                                    <td className="p-2 font-medium">{row.roll}</td>
                                                                    <td className="p-2">{row.attendance}</td>
                                                                    <td className="p-2">{row.ct}</td>
                                                                    <td className={`p-2 ${row.isValid ? 'text-emerald-500' : 'text-red-500 font-medium'}`}>
                                                                        {row.status}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {previewData.length > 50 && (
                                                                <tr>
                                                                    <td colSpan={5} className="p-2 text-center text-muted-foreground">
                                                                        ... and {previewData.length - 50} more rows
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-end gap-3 mt-4">
                                            <Button variant="outline" onClick={() => { setIsBulkModalOpen(false); setUploadFile(null); setPreviewData(null); }}>Cancel</Button>
                                            <Button disabled={!uploadFile || previewStats.valid === 0} isLoading={isUploading} onClick={handleFileUpload}>
                                                Import Valid Records
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                            <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="font-bold text-emerald-600">Upload Processed</p>
                                            <p className="text-sm text-emerald-600/80">Successfully imported {uploadResult.valid} records.</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center px-2 py-1 bg-secondary rounded text-xs font-medium">
                                            <span>Total Rows: {uploadResult.total}</span>
                                            <span className="text-emerald-500">Valid Rows: {uploadResult.valid}</span>
                                            <span className={uploadResult.invalid > 0 ? "text-red-500" : ""}>Invalid Rows: {uploadResult.invalid}</span>
                                        </div>
                                        
                                        {uploadResult.invalid > 0 && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                                <p className="text-sm font-bold text-red-600 mb-2">Errors Details</p>
                                                <div className="max-h-32 overflow-y-auto text-xs space-y-2">
                                                    {uploadResult.errors.map((err: any, i: number) => (
                                                        <div key={i} className="flex gap-2">
                                                            <span className="font-mono text-red-700 shrink-0">Row {err.row}:</span>
                                                            <span className="text-red-600">{err.message}</span>
                                                        </div>
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
