"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Users,
    Search,
    MoreHorizontal,
    UserPlus,
    Filter,
    Download
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function UserManagementPage() {
    const users = [
        { name: "Dr. Abdur Rahman", role: "Teacher", dept: "Mathematics", status: "Active", joined: "2 hours ago", email: "a.rahman@inst.edu" },
        { name: "Fahim Ahmed", role: "Student", dept: "Computer Science", status: "Active", joined: "Oct 2025", email: "f.ahmed@inst.edu" },
        { name: "Admin_Sakib", role: "Admin", dept: "IT Support", status: "Active", joined: "Jan 2024", email: "admin@inst.edu" },
        { name: "Asif Iqbal", role: "Student", dept: "Physics", status: "Inactive", joined: "Nov 2025", email: "a.iqbal@inst.edu" },
        { name: "Sumaiya Akter", role: "Teacher", dept: "Biology", status: "Active", joined: "Sep 2025", email: "s.akter@inst.edu" },
        { name: "Rezwanul Haque", role: "Student", dept: "Chemistry", status: "Active", joined: "Dec 2025", email: "r.haque@inst.edu" },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Institution Users</h1>
                        <p className="text-muted-foreground">Manage and monitor all institutional accounts and permissions.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </div>
                </div>

                {/* Filters/Search */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users by name, email, or ID..." className="pl-9 h-10" />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                            <select className="flex-1 md:flex-none h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
                                <option>All Roles</option>
                                <option>Admin</option>
                                <option>Teacher</option>
                                <option>Student</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-secondary/10 border-b border-border">
                        <CardTitle className="text-lg">User Directory</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30 text-xs font-bold uppercase text-muted-foreground">
                                        <th className="p-4 px-6 text-pointer">User</th>
                                        <th className="p-4 px-6">Email</th>
                                        <th className="p-4 px-6">Role</th>
                                        <th className="p-4 px-6">Department</th>
                                        <th className="p-4 px-6">Status</th>
                                        <th className="p-4 px-6">Joined</th>
                                        <th className="p-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map((user, i) => (
                                        <motion.tr
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-secondary/20 transition-colors"
                                        >
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-sm text-muted-foreground">{user.email}</td>
                                            <td className="p-4 px-6">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'Admin' ? 'bg-slate-800 text-white' :
                                                    user.role === 'Teacher' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 text-sm text-muted-foreground">{user.dept}</td>
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <span className="text-xs font-medium">{user.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-xs text-muted-foreground">{user.joined}</td>
                                            <td className="p-4 px-6 text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
