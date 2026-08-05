"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UserCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    BookOpen,
    Calendar,
    Bell,
    MessageSquare,
    Users,
    ShieldCheck,
    BarChart4,
    AlertTriangle,
    UserCheck,
    Activity,
    Target
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "./ui/Button";

interface SidebarProps {
    role: "student" | "teacher" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const [localUser, setLocalUser] = useState<{ name: string; role: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setLocalUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const userName = localUser?.name || "User";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    };

    const getLinks = () => {
        const common = [
            { name: "Dashboard", href: `/dashboard/${role}`, icon: LayoutDashboard },
            { name: "Messages", href: `/dashboard/${role}/messages`, icon: MessageSquare },
            { name: "Settings", href: `/dashboard/${role}/settings`, icon: Settings },
            { name: "Profile", href: `/dashboard/${role}/profile`, icon: UserCircle },
        ];

        const studentLinks = [
            { name: "My Progress", href: "/dashboard/student/progress", icon: BarChart4 },
            { name: "Recommendations", href: "/dashboard/student/recommendations", icon: Target },
            { name: "Courses", href: "/dashboard/student/courses", icon: BookOpen },
            { name: "Schedule", href: "/dashboard/student/schedule", icon: Calendar },
        ];

        const teacherLinks = [
            { name: "My Students", href: "/dashboard/teacher/students", icon: Users },
            { name: "Interventions", href: "/dashboard/teacher/interventions", icon: Target },
            { name: "Risk Reports", href: "/dashboard/teacher/reports", icon: AlertTriangle },
            { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart4 },
            { name: "Student Approvals", href: "/dashboard/teacher/approvals", icon: UserCheck },
        ];

        const adminLinks = [
            { name: "Institutional Directory", href: "/dashboard/admin/users", icon: ShieldCheck },
            { name: "Intervention Center", href: "/dashboard/admin/intervention-center", icon: Target },
            { name: "Global Analytics", href: "/dashboard/admin/analytics", icon: BarChart4 },
            { name: "System Config", href: "/dashboard/admin/config", icon: Settings },
            { name: "System Health", href: "/dashboard/admin/system-health", icon: Activity },
        ];

        if (role === "student") return [...common.slice(0, 1), ...studentLinks, ...common.slice(1)];
        if (role === "teacher") return [...common.slice(0, 1), ...teacherLinks, ...common.slice(1)];
        return [...common.slice(0, 1), ...adminLinks, ...common.slice(1)];
    };

    const links = getLinks();

    return (
        <aside
            className={cn(
                "relative h-screen border-r border-border bg-card transition-all duration-300 flex flex-col",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex h-16 items-center px-6">
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <GraduationCap className="h-8 w-8 text-primary shrink-0" />
                    {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap">DropoutRisk</span>}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? link.name : ""}
                        >
                            <link.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>{link.name}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-border">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {userInitials}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground truncate uppercase">{localUser?.role || role}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {userInitials}
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn("w-full justify-start text-muted-foreground hover:text-destructive", isCollapsed && "justify-center p-0")}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3">Sign out</span>}
                </Button>
            </div>

            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-secondary md:flex"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
        </aside>
    );
}
