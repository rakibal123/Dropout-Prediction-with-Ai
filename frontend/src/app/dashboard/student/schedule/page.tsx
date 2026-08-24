"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { 
    Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, 
    ChevronRight, Plus, Download, Bell, BookOpen, AlertCircle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

interface ScheduleItem {
    id: string;
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
    time: string;
    code: string;
    title: string;
    instructor: string;
    room: string;
    type: "Lecture" | "Lab" | "Tutorial";
    color: string;
}

export default function StudentSchedulePage() {
    const [viewMode, setViewMode] = useState<"Weekly" | "Daily" | "List">("Weekly");
    const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday">("Monday");
    const { showToast } = useToast();

    const timetable: ScheduleItem[] = [
        { id: "1", day: "Monday", time: "09:00 AM - 10:30 AM", code: "CS401", title: "Machine Learning & AI", instructor: "Dr. Sarah Jenkins", room: "Lab 302", type: "Lecture", color: "border-l-blue-500 bg-blue-500/10" },
        { id: "2", day: "Monday", time: "11:00 AM - 12:30 PM", code: "CS305", title: "Database Systems", instructor: "Dr. Maria Torres", room: "Room 105", type: "Lecture", color: "border-l-emerald-500 bg-emerald-500/10" },
        { id: "3", day: "Tuesday", time: "10:00 AM - 11:30 AM", code: "CS310", title: "Software Engineering", instructor: "Dr. Emily Carter", room: "Auditorium 1", type: "Lecture", color: "border-l-amber-500 bg-amber-500/10" },
        { id: "4", day: "Tuesday", time: "01:00 PM - 03:00 PM", code: "CS202", title: "Data Structures Lab", instructor: "Prof. Alan Vance", room: "Lab 201", type: "Lab", color: "border-l-indigo-500 bg-indigo-500/10" },
        { id: "5", day: "Wednesday", time: "09:00 AM - 10:30 AM", code: "MATH204", title: "Probability & Statistics", instructor: "Prof. Robert Zhang", room: "Math Annex 201", type: "Lecture", color: "border-l-purple-500 bg-purple-500/10" },
        { id: "6", day: "Wednesday", time: "10:30 AM - 12:00 PM", code: "CS401", title: "AI Lab Session", instructor: "Dr. Sarah Jenkins", room: "Lab 302", type: "Lab", color: "border-l-blue-500 bg-blue-500/10" },
        { id: "7", day: "Thursday", time: "10:00 AM - 11:30 AM", code: "CS310", title: "Software Engineering", instructor: "Dr. Emily Carter", room: "Auditorium 1", type: "Lecture", color: "border-l-amber-500 bg-amber-500/10" },
        { id: "8", day: "Thursday", time: "01:00 PM - 02:30 PM", code: "CS202", title: "Data Structures", instructor: "Prof. Alan Vance", room: "Lecture Hall B", type: "Lecture", color: "border-l-indigo-500 bg-indigo-500/10" },
        { id: "9", day: "Friday", time: "09:00 AM - 10:30 AM", code: "MATH204", title: "Probability & Statistics", instructor: "Prof. Robert Zhang", room: "Math Annex 201", type: "Lecture", color: "border-l-purple-500 bg-purple-500/10" },
        { id: "10", day: "Friday", time: "02:00 PM - 03:30 PM", code: "CS305", title: "DBMS Lab", instructor: "Dr. Maria Torres", room: "Lab 105", type: "Lab", color: "border-l-emerald-500 bg-emerald-500/10" },
    ];

    const upcomingExams = [
        { title: "CS401 Mid-Term Examination", date: "Sep 10, 2026", time: "10:00 AM - 12:00 PM", room: "Main Examination Hall" },
        { title: "CS202 Data Structures Quiz 2", date: "Sep 15, 2026", time: "01:00 PM - 02:00 PM", room: "Lecture Hall B" },
    ];

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Class Schedule & Timetable</h1>
                        <p className="text-muted-foreground">View weekly class sessions, lab hours, and upcoming examination schedules.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary p-1 rounded-lg border border-border">
                            {(["Weekly", "Daily", "List"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                        viewMode === mode ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => showToast("Timetable exported to iCal format", "success")}>
                            <Download className="h-4 w-4 mr-2" /> Export Calendar
                        </Button>
                    </div>
                </div>

                {/* Next Class Banner */}
                <Card className="border-none shadow-premium bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-l-4 border-l-primary">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shrink-0">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">Up Next Today</span>
                                <h3 className="text-lg font-bold text-foreground">CS401: Machine Learning & AI Lecture</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                    <span>09:00 AM - 10:30 AM</span> • <span>Lab 302</span> • <span>Dr. Sarah Jenkins</span>
                                </p>
                            </div>
                        </div>
                        <Button className="shadow-premium shrink-0" onClick={() => showToast("Class reminder set!", "success")}>
                            <Bell className="h-4 w-4 mr-2" /> Set Reminder
                        </Button>
                    </CardContent>
                </Card>

                {/* Weekly View */}
                {viewMode === "Weekly" && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {days.map((day) => {
                            const dayItems = timetable.filter(item => item.day === day);
                            return (
                                <Card key={day} className="border-none shadow-premium bg-card overflow-hidden">
                                    <CardHeader className="bg-secondary/30 p-3 text-center border-b border-border">
                                        <CardTitle className="text-sm font-bold text-foreground">{day}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 space-y-3 min-h-[300px]">
                                        {dayItems.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center py-10 text-muted-foreground text-xs">
                                                <span>No classes scheduled</span>
                                            </div>
                                        ) : (
                                            dayItems.map((item) => (
                                                <div key={item.id} className={`p-3 rounded-lg border-l-4 ${item.color} border border-border/40 text-xs space-y-1 hover:shadow-md transition-all`}>
                                                    <span className="font-bold text-foreground text-sm block">{item.code}</span>
                                                    <p className="font-semibold text-muted-foreground truncate">{item.title}</p>
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                                                        <Clock className="h-3 w-3 shrink-0 text-primary" />
                                                        <span>{item.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                                        <span>{item.room}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Daily View */}
                {viewMode === "Daily" && (
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {days.map((day) => (
                                <Button
                                    key={day}
                                    variant={selectedDay === day ? "primary" : "outline"}
                                    onClick={() => setSelectedDay(day)}
                                    className="text-xs"
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>

                        <Card className="border-none shadow-premium bg-card p-6">
                            <h3 className="font-bold text-lg mb-4">{selectedDay}'s Class Schedule</h3>
                            <div className="space-y-4">
                                {timetable.filter(i => i.day === selectedDay).map((item) => (
                                    <div key={item.id} className={`p-4 rounded-xl border-l-4 ${item.color} border border-border/40 flex justify-between items-center`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">{item.code}</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">{item.type}</span>
                                            </div>
                                            <h4 className="font-bold text-foreground text-base">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-4">
                                                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> {item.instructor}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {item.room}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-primary text-sm block">{item.time}</span>
                                            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => showToast(`Added notification for ${item.code}`, "info")}>
                                                Notify Me
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* List View */}
                {viewMode === "List" && (
                    <Card className="border-none shadow-premium bg-card overflow-hidden">
                        <CardHeader className="border-b border-border bg-card/50 px-6 py-4">
                            <CardTitle className="text-lg">Full Schedule Directory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Day</th>
                                            <th className="px-6 py-3 font-semibold">Time</th>
                                            <th className="px-6 py-3 font-semibold">Course</th>
                                            <th className="px-6 py-3 font-semibold">Instructor</th>
                                            <th className="px-6 py-3 font-semibold">Room</th>
                                            <th className="px-6 py-3 font-semibold">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {timetable.map((item) => (
                                            <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground">{item.day}</td>
                                                <td className="px-6 py-4 font-medium text-primary">{item.time}</td>
                                                <td className="px-6 py-4 font-semibold text-foreground">{item.code}: {item.title}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{item.instructor}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{item.room}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary text-muted-foreground">{item.type}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Examinations Section */}
                <Card className="border-none shadow-premium bg-card">
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" /> Upcoming Examinations & Major Quizzes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcomingExams.map((exam, i) => (
                                <div key={i} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-amber-500 text-white font-bold shrink-0">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">{exam.title}</h4>
                                        <p className="text-xs text-amber-400 font-bold mt-1">{exam.date} • {exam.time}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Location: {exam.room}</p>
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
