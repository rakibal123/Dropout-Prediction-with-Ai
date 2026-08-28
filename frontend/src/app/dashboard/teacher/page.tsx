"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, FileDown, Activity, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { MLSandboxModal } from "@/components/MLSandboxModal";

// Interfaces
interface Semester { _id: string; name: string; }
interface Course { _id: string; code: string; title: string; }
interface TeachingCourse { course: Course; studentsCount: number; assessedCount: number; }
interface MyTeachingSemester { semester: Semester; courses: TeachingCourse[]; }

export default function TeacherDashboard() {
    const router = useRouter();
    const { showToast } = useToast();

    // Course Selection State
    const [myTeaching, setMyTeaching] = useState<MyTeachingSemester[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [isSandboxOpen, setIsSandboxOpen] = useState(false);

    useEffect(() => {
        fetchMyTeaching();
    }, []);

    const fetchMyTeaching = async () => {
        setLoadingCourses(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/teacher/my-courses`, {
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

    return (
        <DashboardLayout role="teacher">
            <div className="flex flex-col gap-8 p-4 md:p-8">
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Teaching</h1>
                            <p className="text-muted-foreground mt-2">Select a course to view students and manage assessments.</p>
                        </div>
                        <Button onClick={() => setIsSandboxOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white shadow-premium gap-2">
                            <Activity className="h-4 w-4" /> Try ML Sandbox
                        </Button>
                    </div>
                </div>

                <MLSandboxModal isOpen={isSandboxOpen} onClose={() => setIsSandboxOpen(false)} />

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
                        <Button variant="outline" className="mt-6 gap-2" onClick={() => setIsSandboxOpen(true)}>
                            <Activity className="h-4 w-4 text-purple-500" /> Open Sandbox Simulator
                        </Button>
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
                                            className="hover:border-primary transition-all hover:shadow-md group border-2 flex flex-col"
                                        >
                                            <CardHeader>
                                                <CardTitle className="group-hover:text-primary transition-colors text-lg">{c.course.title || 'Course'}</CardTitle>
                                                <p className="text-xs text-muted-foreground font-mono bg-secondary/50 inline-block px-2 py-1 rounded w-max mt-1">{c.course.code}</p>
                                            </CardHeader>
                                            <CardContent className="flex flex-col flex-1">
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
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
                                                    <div 
                                                        className={`h-full ${c.assessedCount === c.studentsCount && c.studentsCount > 0 ? "bg-emerald-500" : "bg-primary"}`} 
                                                        style={{ width: `${c.studentsCount > 0 ? (c.assessedCount / c.studentsCount) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                
                                                <div className="mt-auto pt-4 border-t border-border">
                                                    <Button 
                                                        className="w-full"
                                                        onClick={() => router.push(`/dashboard/teacher/courses/${c.course._id}?semesterId=${sem.semester._id}&semesterName=${encodeURIComponent(sem.semester.name)}&courseName=${encodeURIComponent(c.course.title || '')}&courseCode=${encodeURIComponent(c.course.code)}`)}
                                                    >
                                                        Open Course
                                                    </Button>
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
