"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/Button";
import { Menu, X, Bell, Search, UserCircle } from "lucide-react";
import { Input } from "./ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationCenter } from "./NotificationCenter";

import ProtectedRoute from "./guards/ProtectedRoute";
import RoleGuard from "./guards/RoleGuard";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: "student" | "teacher" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const userName = user?.name || "User";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <ProtectedRoute>
            <RoleGuard allowedRoles={[role]}>
                <div className="flex h-screen bg-background overflow-hidden">
                    {/* Sidebar - Always visible */}
                    <div className="flex flex-col z-40">
                        <Sidebar role={role} />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Top Header */}
                        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-4 flex items-center justify-between z-30">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center relative w-64 md:w-80">
                                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search records, students..." className="pl-10 h-9" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4">
                                <NotificationCenter />
                                <div className="h-8 w-px bg-border hidden sm:block" />
                                <div className="flex items-center gap-2 pl-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold">{userName}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{user?.role || role}</p>
                                    </div>
                                    <Button variant="ghost" className="h-9 w-9 rounded-full p-0 overflow-hidden border border-border">
                                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {userInitials}
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {/* Dynamic Page Content */}
                        <main className="flex-1 overflow-y-auto bg-secondary/30 relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="p-4 md:p-8 min-h-full"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </RoleGuard>
        </ProtectedRoute>
    );
}
