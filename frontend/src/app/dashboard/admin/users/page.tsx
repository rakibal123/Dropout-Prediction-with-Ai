"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Users,
    Search,
    MoreHorizontal,
    UserPlus,
    Filter,
    Download,
    RefreshCcw,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Power
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    
    // Modal
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const { showToast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                role: roleFilter,
                status: statusFilter
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.users);
                setTotalPages(data.data.pages);
            }
        } catch (error) {
            showToast("Failed to fetch users", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, roleFilter, statusFilter]);

    const viewDetails = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSelectedUser(data.data.user);
                setUserDetails(data.data);
                setIsDetailsModalOpen(true);
            }
        } catch (error) {
            showToast("Failed to fetch user details", "error");
        }
    };

    const updateUserStatus = async (userId: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast("User status updated successfully", "success");
                fetchUsers();
                if (selectedUser && selectedUser._id === userId) {
                    setIsDetailsModalOpen(false);
                }
            }
        } catch (error) {
            showToast("Failed to update status", "error");
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you absolutely sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast("User deleted successfully", "success");
                fetchUsers();
            }
        } catch (error) {
            showToast("Failed to delete user", "error");
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Institution Users</h1>
                        <p className="text-muted-foreground">Manage and monitor all institutional accounts and permissions.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </div>
                </div>

                {/* Filters/Search */}
                <Card className="border-none shadow-premium bg-card">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email, or ID..." 
                                className="pl-9 h-10" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select 
                                className="flex-1 md:flex-none h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-ring"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                            </select>
                            <select 
                                className="flex-1 md:flex-none h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-ring"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="border-none shadow-premium overflow-hidden bg-card">
                    <CardHeader className="bg-secondary/10 border-b border-border pb-3 pt-4">
                        <CardTitle className="text-lg">User Directory</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30 text-xs font-bold uppercase text-muted-foreground">
                                        <th className="p-4 px-6">User</th>
                                        <th className="p-4 px-6">Email</th>
                                        <th className="p-4 px-6">Role</th>
                                        <th className="p-4 px-6">Department</th>
                                        <th className="p-4 px-6">Status</th>
                                        <th className="p-4 px-6">Joined</th>
                                        <th className="p-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                                <RefreshCcw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                                <Users className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                                                No users found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, i) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-secondary/20 transition-colors"
                                            >
                                                <td className="p-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm uppercase">
                                                            {user.fullName ? user.fullName.charAt(0) : 'U'}
                                                        </div>
                                                        <span className="text-sm font-semibold">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6 text-muted-foreground">{user.email}</td>
                                                <td className="p-4 px-6 uppercase text-[10px] font-bold">
                                                    <span className={`px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-slate-800 text-white' : user.role === 'teacher' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 px-6 text-muted-foreground">{user.department || '-'}</td>
                                                <td className="p-4 px-6">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                                        ${user.status === 'approved' || user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                        user.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'}
                                                    `}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 px-6 text-xs text-muted-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => viewDetails(user._id)} title="View Details">
                                                            <Eye className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        {user.status === 'pending' && (
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => updateUserStatus(user._id, 'approved')} title="Approve">
                                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteUser(user._id)} title="Delete">
                                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-border flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-xl p-6"
                        >
                            <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-2xl uppercase">
                                        {selectedUser.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedUser.status === 'pending' ? (
                                        <>
                                            <Button variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateUserStatus(selectedUser._id, 'approved')}>Approve</Button>
                                            <Button variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-500/10" onClick={() => updateUserStatus(selectedUser._id, 'rejected')}>Reject</Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" onClick={() => updateUserStatus(selectedUser._id, selectedUser.status === 'active' || selectedUser.status === 'approved' ? 'inactive' : 'active')}>
                                            <Power className="h-4 w-4 mr-2" />
                                            {selectedUser.status === 'active' || selectedUser.status === 'approved' ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}><XCircle className="h-6 w-6" /></Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Personal & Academic Info</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Role:</span> <span className="font-medium uppercase">{selectedUser.role}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="font-medium uppercase">{selectedUser.status}</span></div>
                                        {selectedUser.role === 'student' && (
                                            <>
                                                <div className="flex justify-between"><span className="text-muted-foreground">Roll Number:</span> <span className="font-medium">{selectedUser.rollNumber}</span></div>
                                                <div className="flex justify-between"><span className="text-muted-foreground">Reg Number:</span> <span className="font-medium">{selectedUser.registrationNumber}</span></div>
                                                <div className="flex justify-between"><span className="text-muted-foreground">Department:</span> <span className="font-medium">{selectedUser.department}</span></div>
                                                <div className="flex justify-between"><span className="text-muted-foreground">Semester:</span> <span className="font-medium">{selectedUser.semester}</span></div>
                                            </>
                                        )}
                                        <div className="flex justify-between"><span className="text-muted-foreground">Joined:</span> <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Last Login:</span> <span className="font-medium">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span></div>
                                    </div>
                                </div>

                                {selectedUser.role === 'student' && (
                                    <div>
                                        <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Recent Predictions</h3>
                                        {userDetails?.predictionHistory?.length > 0 ? (
                                            <div className="space-y-3">
                                                {userDetails.predictionHistory.map((pred: any) => (
                                                    <div key={pred._id} className="p-3 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                                                        <div>
                                                            <div className="font-medium">{new Date(pred.createdAt).toLocaleDateString()}</div>
                                                            <div className="text-muted-foreground text-xs">Score: {pred.finalScore}</div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                                            ${pred.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                            pred.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {pred.riskLevel} Risk
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No predictions found.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedUser.role === 'student' && (
                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Behavior History</h3>
                                    {userDetails?.behaviorRecords?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-secondary/20 text-muted-foreground">
                                                    <tr>
                                                        <th className="p-2">Date</th>
                                                        <th className="p-2">Attendance</th>
                                                        <th className="p-2">Assignments</th>
                                                        <th className="p-2">Study Hrs</th>
                                                        <th className="p-2">Stress</th>
                                                        <th className="p-2">Motivation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {userDetails.behaviorRecords.map((record: any) => (
                                                        <tr key={record._id}>
                                                            <td className="p-2">{new Date(record.createdAt).toLocaleDateString()}</td>
                                                            <td className="p-2">{record.attendancePercentage}%</td>
                                                            <td className="p-2">{record.assignmentSubmissionRate}%</td>
                                                            <td className="p-2">{record.studyHoursPerWeek}</td>
                                                            <td className="p-2">{record.stressLevel}/10</td>
                                                            <td className="p-2">{record.motivationLevel}/10</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No behavior records found.</p>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
