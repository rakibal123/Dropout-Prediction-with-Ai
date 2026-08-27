"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("/");
    const pathname = usePathname();

    const isDashboard = pathname.startsWith("/dashboard");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            try {
                const user = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUserRole(user.role);
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }
    }, [pathname]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActiveSection(window.location.pathname + window.location.hash);
        }
        const handleHashChange = () => {
            if (typeof window !== "undefined") {
                setActiveSection(window.location.pathname + window.location.hash);
            }
        };
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [pathname]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/#features" },
        { name: "About", href: "/#about" },
        { name: "Contact", href: "/#contact" },
    ];

    if (isDashboard) return null;

    return (
        <nav className="sticky top-0 z-[100] w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">
                                DropoutRisk
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.href || (link.href === "/" && activeSection === "/");
                                return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setActiveSection(link.href)}
                                    className={`relative px-3 py-2 text-base font-semibold transition-all duration-300 ease-out ${
                                        isActive 
                                            ? "text-primary" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {link.name}
                                    <span className={`absolute left-2 -bottom-1 w-[calc(100%-1rem)] h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-center ${
                                        isActive ? "scale-x-100" : "scale-x-0"
                                    }`} />
                                </Link>
                                );
                            })}
                            {isLoggedIn ? (
                                <Link href={`/dashboard/${userRole || "student"}`}>
                                    <Button className="ml-4">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="outline" size="sm" className="ml-4">Log in</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-border bg-background"
                    >
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.href || (link.href === "/" && activeSection === "/");
                                return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`block rounded-md px-3 py-2 text-lg font-bold hover:bg-accent transition-colors ${
                                        isActive ? "text-primary border-l-4 border-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() => {
                                        setActiveSection(link.href);
                                        setIsOpen(false);
                                    }}
                                >
                                    {link.name}
                                </Link>
                                );
                            })}
                            {isLoggedIn ? (
                                <Link href={`/dashboard/${userRole || "student"}`} onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">Dashboard</Button>
                                </Link>
                            ) : (
                                <div className="mt-4 flex flex-col gap-2 p-2">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Log in</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
