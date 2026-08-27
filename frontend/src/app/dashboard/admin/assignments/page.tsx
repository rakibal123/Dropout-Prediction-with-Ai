"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, Users, Calendar, Plus, RefreshCw, X, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface Teacher { _id: string; fullName: string; email: string; status: string; }
interface Semester { _id: string; name: string; number: number; }
interface Course { _id: string; code: string; title: string; semesterId: any; }
interface Assignment {
    _id: string;
    teacherId: Teacher;
    courseId: Course;
    semesterId: Semester;
    academicYear: number;
}

export default function AdminAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    // Form state
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [academicYear, setAcademicYear] = useState("2026");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const [assRes, teachRes, semRes, courseRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/academic/assignments`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users?role=teacher`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/academic/semesters`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/academic/courses`, { headers })
            ]);

            if (assRes.ok) { const json = await assRes.json(); setAssignments(json.data.assignments); }
            if (teachRes.ok) { const json = await teachRes.json(); setTeachers(json.data.users); }
            if (semRes.ok) { const json = await semRes.json(); setSemesters(json.data.semesters); }
            if (courseRes.ok) { const json = await courseRes.json(); setCourses(json.data.courses); }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !selectedSemester || !selectedCourse) {
            return showToast("Please fill all required fields", "error");
        }
        
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/academic/assignments`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    teacherId: selectedTeacher,
                    semesterId: selectedSemester,
                    courseId: selectedCourse,
                    academicYear: parseInt(academicYear)
                })
            });
            
            const data = await res.json();
            if (res.ok) {
                showToast("Course assigned successfully", "success");
                setIsModalOpen(false);
                fetchData();
            } else {
                showToast(data.message || "Failed to assign course", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter courses based on selected semester
    const availableCourses = courses.filter(c => 
        (typeof c.semesterId === 'object' ? c.semesterId._id : c.semesterId) === selectedSemester
    );

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10 p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Course Assignments</h1>
                        <p className="text-muted-foreground mt-2">Manage which teachers are assigned to which courses.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={fetchData}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                        <Button onClick={() => {
                            setSelectedTeacher("");
                            setSelectedSemester("");
                            setSelectedCourse("");
                            setIsModalOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" /> Assign Course
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground">
                                No course assignments found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Teacher</th>
                                            <th className="px-6 py-4 font-semibold">Course</th>
                                            <th className="px-6 py-4 font-semibold">Semester</th>
                                            <th className="px-6 py-4 font-semibold">Academic Year</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {assignments.map(a => (
                                            <tr key={a._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold">{a.teacherId?.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{a.teacherId?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-primary">{a.courseId?.title}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{a.courseId?.code}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{a.semesterId?.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{a.academicYear}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assignment Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-lg shadow-xl border-border">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                                <CardTitle className="text-xl">Assign Teacher to Course</CardTitle>
                                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleAssign} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Select Teacher</label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                                            value={selectedTeacher}
                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Select Teacher --</option>
                                            {teachers.filter(t => t.status === 'approved' || t.status === 'active').map(t => (
                                                <option key={t._id} value={t._id}>{t.fullName} ({t.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Select Semester</label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                                            value={selectedSemester}
                                            onChange={(e) => { setSelectedSemester(e.target.value); setSelectedCourse(""); }}
                                            required
                                        >
                                            <option value="">-- Select Semester --</option>
                                            {semesters.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Select Course</label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            required
                                            disabled={!selectedSemester}
                                        >
                                            <option value="">-- Select Course --</option>
                                            {availableCourses.map(c => (
                                                <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Academic Year</label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            required
                                        >
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 flex gap-3 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Assign Course
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
