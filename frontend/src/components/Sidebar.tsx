"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UserCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Calendar,
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

        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };
        handleResize(); // Initialize on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/logout`, {
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
            { name: role === "teacher" ? "My Courses" : "Dashboard", href: `/dashboard/${role}`, icon: role === "teacher" ? BookOpen : LayoutDashboard },
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
            { name: "Interventions", href: "/dashboard/teacher/interventions", icon: Target },
            { name: "Risk Reports", href: "/dashboard/teacher/reports", icon: AlertTriangle },
            { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart4 },
            { name: "Student Approvals", href: "/dashboard/teacher/approvals", icon: UserCheck },
        ];

        const adminLinks = [
            { name: "Institutional Directory", href: "/dashboard/admin/users", icon: ShieldCheck },
            { name: "Course Assignments", href: "/dashboard/admin/assignments", icon: BookOpen },
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
                "relative h-full border-r border-border bg-card transition-all duration-300 flex flex-col",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary",
                                isActive 
                                    ? "bg-primary/15 text-primary border-l-4 border-primary font-bold shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground font-medium border-l-4 border-transparent",
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
                className="absolute -right-3 top-6 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-secondary md:flex z-50"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
        </aside>
    );
}
