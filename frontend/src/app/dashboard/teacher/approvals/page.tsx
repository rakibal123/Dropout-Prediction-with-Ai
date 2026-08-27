"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, UserCheck, RefreshCw, ChevronDown } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface PendingStudent {
    _id: string;
    fullName: string;
    email: string;
    rollNumber?: string;
    registrationNumber?: string;
    department?: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

export default function StudentApprovalsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<PendingStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [filter, setFilter] = useState<"pending" | "all">("pending");

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) { router.push("/login"); return; }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/pending-students`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setStudents(data.data.students);
            } else {
                setError(data.message || "Failed to fetch students");
            }
        } catch {
            setError("Connection error. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const approveStudent = async (studentId: string) => {
        setActionLoading(studentId);
        setSuccessMsg(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/approve-student/${studentId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg(`Student approved successfully!`);
                setStudents((prev) => prev.filter((s) => s._id !== studentId));
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(data.message || "Failed to approve student");
            }
        } catch {
            setError("Connection error.");
        } finally {
            setActionLoading(null);
        }
    };

    const rejectStudent = async (studentId: string) => {
        setActionLoading(`reject-${studentId}`);
        setSuccessMsg(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/reject-student/${studentId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg(`Student rejected.`);
                setStudents((prev) => prev.filter((s) => s._id !== studentId));
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(data.message || "Failed to reject student");
            }
        } catch {
            setError("Connection error.");
        } finally {
            setActionLoading(null);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "??";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <DashboardLayout role="teacher">
            <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <UserCheck className="h-6 w-6 text-primary" />
                            Student Approvals
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Review and approve or reject pending student accounts.
                        </p>
                    </div>
                    <button
                        onClick={fetchStudents}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start sm:self-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Feedback messages */}
                {successMsg && (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/30 px-4 py-3 rounded-lg">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-lg">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Stats bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{students.length}</p>
                            <p className="text-xs text-muted-foreground">Pending Requests</p>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">Pending Student Accounts</h2>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                            {students.length} {students.length === 1 ? "account" : "accounts"}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading pending students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-primary" />
                            </div>
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs text-muted-foreground">No pending student accounts to review.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {students.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
                                >
                                    {/* Student info */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {getInitials(student.fullName)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{student.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {student.rollNumber && (
                                                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">
                                                        Roll: {student.rollNumber}
                                                    </span>
                                                )}
                                                {student.registrationNumber && (
                                                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">
                                                        Reg: {student.registrationNumber}
                                                    </span>
                                                )}
                                                {student.department && (
                                                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
                                                        {student.department}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date + Actions */}
                                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            Registered {formatDate(student.createdAt)}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => rejectStudent(student._id)}
                                                disabled={actionLoading !== null}
                                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === `reject-${student._id}` ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => approveStudent(student._id)}
                                                disabled={actionLoading !== null}
                                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === student._id ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-3 w-3" />
                                                )}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
