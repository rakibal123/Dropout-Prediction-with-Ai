"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { showToast } = useToast();

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                showToast("Login successful! Redirecting...", "success");

                // Redirect based on role
                if (data.user.role === "student") {
                    window.location.href = "/dashboard/student";
                } else if (data.user.role === "admin") {
                    window.location.href = "/dashboard/admin";
                } else if (data.user.role === "teacher") {
                    window.location.href = "/dashboard/teacher";
                }
            } else {
                showToast(data.message || "Login failed", "error");
                setErrors({ email: data.message || "Login failed" });
            }
        } catch (error) {
            console.error("Login error:", error);
            showToast("Connection error. Please ensure the backend is running.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                    <GraduationCap className="h-10 w-10 text-primary" />
                    <span className="text-2xl font-bold tracking-tight">DropoutRisk</span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-foreground">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
                        Create an account
                    </Link>
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <Card className="border-border shadow-premium">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-lg">Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Role Selection: Only Student & Teacher */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Select Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["student", "teacher"].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`py-2 text-xs font-semibold rounded-lg border-2 transition-all ${role === r
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/30"
                                                }`}
                                        >
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <Input
                                    label="Email address"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                />
                                <Mail className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium leading-none">Password</label>
                                    <Link href="#" className="text-xs text-primary hover:text-primary-hover">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                    />
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                                    Remember me
                                </label>
                            </div>

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Sign in
                            </Button>
                        </form>


                    </CardContent>
                </Card>
            </motion.div>

            <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to home
            </Link>
        </div>
    );
}
