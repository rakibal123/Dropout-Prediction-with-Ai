"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/Button";
import { Menu, X, Bell, Search, UserCircle } from "lucide-react";
import { Input } from "./ui/Input";
import { motion, AnimatePresence } from "framer-motion";

import ProtectedRoute from "./guards/ProtectedRoute";
import RoleGuard from "./guards/RoleGuard";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: "student" | "teacher" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

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
                    {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col">
                <Sidebar role={role} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
                        >
                            <Sidebar role={role} />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute right-4 top-4 rounded-md p-1 bg-background border border-border md:hidden"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-4 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-md hover:bg-secondary"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden sm:flex items-center relative w-64 md:w-80">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search records, students..." className="pl-10 h-9" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 rounded-full">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-risk-high ring-2 ring-card" />
                        </Button>
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
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-secondary/30">
                    {children}
                </main>
            </div>
        </div>
        </RoleGuard>
        </ProtectedRoute>
    );
}
