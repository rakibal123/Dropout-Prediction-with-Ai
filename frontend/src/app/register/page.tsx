"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Hash, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        rollNumber: "",
        registrationNumber: "",
        department: "",
        semester: "",
        terms: false
    });
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; terms?: string; rollNumber?: string; registrationNumber?: string; department?: string; semester?: string; }>({});
    const { showToast } = useToast();

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!formData.fullName) newErrors.fullName = "Full name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (role === 'student') {
            if (!formData.rollNumber) newErrors.rollNumber = "Roll number is required";
            if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required";
            if (!formData.department) newErrors.department = "Department is required";
            if (!formData.semester) newErrors.semester = "Semester is required";
        }

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase, and a number";
        }

        if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (!formData.terms) newErrors.terms = "You must agree to the terms";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    role: role,
                    ...(role === 'student' && {
                        rollNumber: formData.rollNumber,
                        registrationNumber: formData.registrationNumber,
                        department: formData.department,
                        semester: formData.semester
                    })
                })
            });

            const data = await response.json();

            if (response.ok || response.status === 201) {
                // Clear the form
                setFormData({
                    fullName: "", email: "", password: "", confirmPassword: "", 
                    rollNumber: "", registrationNumber: "", department: "", semester: "", terms: false
                });
                setErrors({});
                setShowSuccessModal(true);
            } else {
                if (data.errors) {
                    const backendErrors: any = {};
                    data.errors.forEach((err: any) => {
                        backendErrors[err.path] = err.msg;
                    });
                    setErrors(backendErrors);
                } else {
                    setErrors({ email: data.message || "Registration failed" });
                }
                showToast(data.message || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
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
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                        Sign in
                    </Link>
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <Card className="border-border shadow-premium overflow-hidden">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-lg">Register as {role.charAt(0).toUpperCase() + role.slice(1)}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Select Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["student", "teacher", "admin"].map((r) => (
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
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="pl-10"
                                />
                                <User className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
                                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                            </div>

                            <div className="relative">
                                <Input
                                    label="Email address"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10"
                                />
                                <Mail className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {role === 'student' && (
                                <>
                                    <div className="relative">
                                        <Input
                                            label="Roll Number"
                                            placeholder="12345"
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                            className="pl-10"
                                        />
                                        <Hash className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
                                        {errors.rollNumber && <p className="mt-1 text-xs text-red-500">{errors.rollNumber}</p>}
                                    </div>

                                    <div className="relative">
                                        <Input
                                            label="Registration Number"
                                            placeholder="REG001"
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                            className="pl-10"
                                        />
                                        <Hash className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
                                        {errors.registrationNumber && <p className="mt-1 text-xs text-red-500">{errors.registrationNumber}</p>}
                                    </div>

                                    <div className="relative">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium leading-none">Department</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    className="flex w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                                >
                                                    <option value="" disabled>Select Department</option>
                                                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                                                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                    <option value="Civil Engineering">Civil Engineering</option>
                                                    <option value="Software Engineering">Software Engineering</option>
                                                    <option value="Information Technology">Information Technology</option>
                                                </select>
                                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>
                                        {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
                                    </div>

                                    <div className="relative">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium leading-none">Semester</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.semester}
                                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                    className="flex w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                                >
                                                    <option value="" disabled>Select Semester</option>
                                                    <option value="1st Semester">1st Semester</option>
                                                    <option value="2nd Semester">2nd Semester</option>
                                                    <option value="3rd Semester">3rd Semester</option>
                                                    <option value="4th Semester">4th Semester</option>
                                                    <option value="5th Semester">5th Semester</option>
                                                    <option value="6th Semester">6th Semester</option>
                                                    <option value="7th Semester">7th Semester</option>
                                                    <option value="8th Semester">8th Semester</option>
                                                </select>
                                                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>
                                        {errors.semester && <p className="mt-1 text-xs text-red-500">{errors.semester}</p>}
                                    </div>
                                </>
                            )}

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
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                            <div className="relative">
                                <label className="text-sm font-medium leading-none mb-1.5 block">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10 pr-10"
                                    />
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={formData.terms}
                                        onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                    />
                                </div>
                                <div className="ml-3 text-xs leading-5 text-muted-foreground">
                                    By signing up, you agree to our{" "}
                                    <Link href="#" className="text-primary hover:underline">Terms</Link> and{" "}
                                    <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                                    {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to home
            </Link>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card text-card-foreground p-8 rounded-xl shadow-2xl max-w-sm w-full border border-border text-center"
                    >
                        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Registration Successful</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            {role === 'admin' ? (
                                <>
                                    Your admin account has been created and approved automatically.
                                    <br /><br />
                                    You can now log in to access the system.
                                </>
                            ) : (
                                <>
                                    Your account request has been submitted successfully.
                                    <br /><br />
                                    Please wait until an Admin approves your account. You will be able to log in after approval.
                                </>
                            )}
                        </p>
                        <Button 
                            className="w-full"
                            onClick={() => window.location.href = "/login"}
                        >
                            OK
                        </Button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
