"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { 
    BookOpen, User, Clock, MapPin, Calendar, CheckCircle2, 
    FileText, Search, ExternalLink, MessageSquare, AlertCircle, ChevronRight, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

interface Course {
    id: string;
    code: string;
    title: string;
    instructor: string;
    instructorEmail: string;
    credits: number;
    room: string;
    schedule: string;
    progress: number;
    grade: string;
    category: string;
    description: string;
    syllabus: { week: number; topic: string; status: "Completed" | "In Progress" | "Upcoming" }[];
    upcomingAssignments: { title: string; dueDate: string; type: "Assignment" | "Quiz" | "Project" }[];
}

export default function StudentCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const { showToast } = useToast();

    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`/api/student/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const data = await res.json();
                
                if (data.status === 'success' && data.data && data.data.courses) {
                    const mappedCourses = data.data.courses.map((c: any) => ({
                        id: c._id,
                        code: c.code || 'N/A',
                        title: c.title || 'Course',
                        instructor: c.teacher?.fullName || 'Not Assigned',
                        instructorEmail: c.teacher?.email || 'N/A',
                        credits: c.credits || 3,
                        room: 'Online/TBA',
                        schedule: 'TBA',
                        progress: c.dataStatus === 'Available' ? 100 : 0,
                        grade: c.dataStatus === 'Available' ? 'Evaluated' : 'Pending',
                        category: 'Core',
                        description: c.description || 'No description provided.',
                        risk: c.risk, // Adding risk for display
                        syllabus: [
                            { week: 1, topic: 'Introduction', status: 'Completed' },
                            { week: 2, topic: 'Core Concepts', status: 'In Progress' }
                        ],
                        upcomingAssignments: []
                    }));
                    setCourses(mappedCourses);
                }
            } catch (error) {
                console.error("Error fetching courses", error);
                showToast("Failed to fetch courses.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
                        <p className="text-muted-foreground">Manage your enrolled courses, syllabus progress, and course-specific tasks.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search courses or codes..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-input bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="All">All Categories</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                        </select>
                    </div>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="flex justify-center p-12 text-muted-foreground">Loading...</div>
                ) : courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-xl border-dashed bg-card/30">
                        <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No courses assigned yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md">You haven't been assigned to any courses for the current semester. Please check back later or contact your advisor.</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex justify-center p-12 text-muted-foreground">No courses match your search.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-none shadow-premium bg-card flex flex-col justify-between h-full hover:shadow-2xl transition-all duration-300 group overflow-hidden border border-border/40 hover:border-primary/40">
                                    <div>
                                        <div className="bg-gradient-to-r from-primary/10 to-transparent p-5 border-b border-border/60 relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white">{course.code}</span>
                                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    Grade: {course.grade}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-primary shrink-0" /> {course.instructor}
                                            </p>
                                        </div>

                                        <CardContent className="p-5 space-y-4">
                                            <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted-foreground">Syllabus Completion</span>
                                                    <span className="font-bold text-foreground">{course.progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <span className="truncate">{course.schedule}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <span className="truncate">{course.room}</span>
                                                </div>
                                            </div>

                                            {course.upcomingAssignments.length > 0 && (
                                                <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Next Pending Task</p>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-medium text-foreground truncate max-w-[170px]">{course.upcomingAssignments[0].title}</span>
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                                                            {course.upcomingAssignments[0].dueDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>

                                    <div className="p-4 border-t border-border bg-card/50 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setSelectedCourse(course)}>
                                            <BookOpen className="h-3.5 w-3.5 mr-1" /> View Syllabus
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/10" onClick={() => window.location.href = `/dashboard/student/messages`}>
                                            <MessageSquare className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Course Details & Syllabus Modal */}
                <AnimatePresence>
                    {selectedCourse && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-xl p-6"
                            >
                                <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">{selectedCourse.code}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{selectedCourse.credits} Credits</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">{selectedCourse.title}</h2>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedCourse.description}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>✕</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-secondary/20 p-4 rounded-xl border border-border/40">
                                    <div>
                                        <p className="text-muted-foreground font-semibold uppercase">Instructor</p>
                                        <p className="font-bold text-foreground mt-0.5">{selectedCourse.instructor}</p>
                                        <p className="text-muted-foreground">{selectedCourse.instructorEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-semibold uppercase">Class Schedule</p>
                                        <p className="font-bold text-foreground mt-0.5">{selectedCourse.schedule}</p>
                                        <p className="text-muted-foreground">{selectedCourse.room}</p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" /> Syllabus & Weekly Topics
                                </h3>
                                <div className="space-y-2 mb-6">
                                    {selectedCourse.syllabus.map((s) => (
                                        <div key={s.week} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/40 text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-muted-foreground w-12">Week {s.week}</span>
                                                <span className="font-medium text-foreground">{s.topic}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                s.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                s.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-secondary text-muted-foreground'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" /> Upcoming Deadlines
                                </h3>
                                <div className="space-y-2 mb-6">
                                    {selectedCourse.upcomingAssignments.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic p-3 bg-secondary/10 rounded-lg border border-border/40">No upcoming assignments.</p>
                                    ) : (
                                        selectedCourse.upcomingAssignments.map((a, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/40 text-xs">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">{a.type}</span>
                                                    <span className="font-medium text-foreground">{a.title}</span>
                                                </div>
                                                <span className="text-amber-400 font-bold">{a.dueDate}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                                    <Button variant="outline" onClick={() => setSelectedCourse(null)}>Close</Button>
                                    <Button variant="primary" onClick={() => { showToast("Downloading course syllabus PDF...", "success"); setSelectedCourse(null); }}>
                                        <Download className="h-4 w-4 mr-2" /> Download Syllabus PDF
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
