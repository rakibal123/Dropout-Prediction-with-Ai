"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    CheckCircle2,
    TrendingUp,
    Clock,
    Award,
    BookOpen,
    Zap,
    ChevronRight,
    ShieldCheck,
    Loader2,
    AlertCircle
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { ExplainableAIModal } from "@/components/ExplainableAIModal";

interface PredictionResult {
    id: string;
    riskLevel: "Low" | "Medium" | "High";
    probability: number;
    reasons: string[];
    suggestions: string[];
}

export default function StudentDashboard() {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssessing, setIsAssessing] = useState(false);
    
    // Dynamic Data States
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [behavior, setBehavior] = useState<any>(null);
    
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
        
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/login");
                return;
            }

            const headers = { "Authorization": `Bearer ${token}` };

            const [dashRes, predRes, behavRes] = await Promise.all([
                fetch("http://localhost:5000/api/student/dashboard", { headers }),
                fetch("http://localhost:5000/api/student/predictions/latest", { headers }),
                fetch("http://localhost:5000/api/student/behavior/latest", { headers })
            ]);

            if (!dashRes.ok) throw new Error("Failed to load dashboard data");

            const dashData = await dashRes.json();
            const predData = await predRes.json();
            const behavData = await behavRes.json();

            setDashboardData(dashData.data);
            setBehavior(behavData.data);

            if (predData.data) {
                setPrediction({
                    id: predData.data._id,
                    riskLevel: predData.data.riskLevel,
                    probability: predData.data.probability?.high || predData.data.confidence || 0,
                    reasons: predData.data.topFactors ? predData.data.topFactors.map((f: any) => `${f.feature} (${f.impact} Impact)`) : (predData.data.reasons || ["Low engagement", "Declining attendance"]),
                    suggestions: predData.data.recommendation ? predData.data.recommendation : (predData.data.suggestions || ["Meet with academic advisor", "Join study groups"])
                });
            }
        } catch (err: any) {
            console.error("Dashboard fetch error:", err);
            setError("Could not load real-time data. " + (err.message || "Network Error"));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex-1 h-[80vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading your academic profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    const firstName = dashboardData?.fullName ? dashboardData.fullName.split(" ")[0] : (user?.name ? user.name.split(" ")[0] : "Student");
    
    // Use real behavior data if available
    const attPct = behavior?.attendancePercentage || 0;
    const subPct = behavior?.assignmentSubmissionRate || 0;
    const quizAvg = behavior?.quizAverage || 0;

    const stats = [
        {
            label: "Attendance",
            value: `${attPct}%`,
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            label: "Submissions",
            value: `${subPct}%`,
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            label: "Quiz Avg",
            value: `${quizAvg}`,
            icon: Zap,
            color: "text-orange-600",
            bg: "bg-orange-100"
        },
        {
            label: "Risk Level",
            value: prediction?.riskLevel || "Safe",
            icon: ShieldCheck,
            color: prediction?.riskLevel === 'High' ? "text-red-600" : (prediction?.riskLevel === 'Medium' ? "text-yellow-600" : "text-green-600"),
            bg: prediction?.riskLevel === 'High' ? "bg-red-100" : (prediction?.riskLevel === 'Medium' ? "bg-yellow-100" : "bg-green-100")
        },
    ];

    const performanceData = [45, 52, 48, 70, 65, 85, 90, 88];
    const riskData = [
        { label: "Low", value: prediction ? (prediction.riskLevel === 'Low' ? 80 : 10) : 65, color: "bg-risk-low" },
        { label: "Medium", value: prediction ? (prediction.riskLevel === 'Medium' ? 70 : 20) : 25, color: "bg-risk-medium" },
        { label: "High", value: prediction ? (prediction.riskLevel === 'High' ? 85 : 5) : 10, color: "bg-risk-high" },
    ];

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
                        <p className="text-muted-foreground">Monitor your performance and risk indicators.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${prediction?.riskLevel === 'High' ? 'bg-risk-high/10 border-risk-high/20' :
                            prediction?.riskLevel === 'Medium' ? 'bg-risk-medium/10 border-risk-medium/20' :
                                'bg-risk-low/10 border-risk-low/20'
                            }`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md ${prediction?.riskLevel === 'High' ? 'bg-risk-high shadow-risk-high/40' :
                                prediction?.riskLevel === 'Medium' ? 'bg-risk-medium shadow-risk-medium/40' :
                                    'bg-risk-low shadow-risk-low/40'
                                }`}>
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${prediction?.riskLevel === 'High' ? 'text-risk-high' :
                                    prediction?.riskLevel === 'Medium' ? 'text-risk-medium' :
                                        'text-risk-low'
                                    }`}>Your Risk Status</p>
                                <p className="font-bold text-foreground">{prediction?.riskLevel ? `${prediction.riskLevel} Risk` : 'Safe / Low Risk'}</p>
                            </div>
                        </div>
                        <Button
                            className="w-full sm:w-auto shadow-premium group"
                            onClick={() => router.push('/dashboard/student/assessment')}
                            disabled={isAssessing}
                        >
                            {isAssessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4 mr-2 group-hover:fill-current transition-all" />
                            )}
                            {isAssessing ? 'Processing...' : 'Check My Risk'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-sm h-full group hover:shadow-md transition-all">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-card pb-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Performance Trend</CardTitle>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-[10px] font-bold">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        Score
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 h-64 relative flex items-end justify-between gap-1 overflow-hidden">
                            <svg className="absolute inset-0 h-full w-full pointer-events-none px-8 py-12" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <path
                                    d={`M ${performanceData.map((h, i) => `${(i / (performanceData.length - 1)) * 800},${200 - (h / 100) * 200}`).join(" L ")}`}
                                    fill="none"
                                    stroke="var(--color-primary)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-20 translate-y-2"
                                />
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    d={`M ${performanceData.map((h, i) => `${(i / (performanceData.length - 1)) * 800},${200 - (h / 100) * 200}`).join(" L ")}`}
                                    fill="none"
                                    stroke="var(--color-primary)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {performanceData.map((h, i) => (
                                    <circle
                                        key={i}
                                        cx={(i / (performanceData.length - 1)) * 800}
                                        cy={200 - (h / 100) * 200}
                                        r="4"
                                        fill="var(--color-primary)"
                                    />
                                ))}
                            </svg>
                            <div className="absolute bottom-4 left-8 right-8 flex justify-between">
                                {performanceData.map((_, i) => (
                                    <p key={i} className="text-[10px] text-muted-foreground font-medium uppercase">W{i + 1}</p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Risk Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-2">
                            <div className="relative h-48 w-48 mb-6">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="var(--color-risk-high)"
                                        strokeWidth="20"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="0"
                                        className="opacity-20"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="var(--color-risk-low)"
                                        strokeWidth="20"
                                        strokeDasharray={`${(riskData[0].value / 100) * 251.2} 251.2`}
                                        strokeDashoffset="0"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="var(--color-risk-medium)"
                                        strokeWidth="20"
                                        strokeDasharray={`${(riskData[1].value / 100) * 251.2} 251.2`}
                                        strokeDashoffset={`${-(riskData[0].value / 100) * 251.2}`}
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="var(--color-risk-high)"
                                        strokeWidth="20"
                                        strokeDasharray={`${(riskData[2].value / 100) * 251.2} 251.2`}
                                        strokeDashoffset={`${-((riskData[0].value + riskData[1].value) / 100) * 251.2}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold">100%</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 w-full gap-2">
                                {riskData.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                                            <span className="text-xs font-semibold">{item.label} Risk</span>
                                        </div>
                                        <span className="text-xs font-bold">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Low Risk (Safe)
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Medium Risk (Monitor)
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        High Risk (At Risk)
                    </div>
                </div>

                {!prediction ? (
                    <Card className="border-none shadow-md overflow-hidden bg-primary/5 border border-primary/10">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <ShieldCheck className="h-16 w-16 text-primary/40 mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">No prediction available yet.</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">Complete your first risk assessment to get a detailed breakdown of your academic standing.</p>
                            <Button className="shadow-premium" onClick={() => router.push('/dashboard/student/assessment')}>
                                <Zap className="h-4 w-4 mr-2" />
                                Check My Risk
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <Card className="border-none shadow-premium-lg bg-gradient-to-br from-card to-secondary/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Risk Assessment Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center p-8 pb-10">
                                <div className="text-6xl font-black text-primary mb-2">
                                    {prediction.probability}%
                                </div>
                                <div className={`text-sm font-bold px-6 py-1.5 rounded-full ${prediction.riskLevel === 'High' ? 'bg-risk-high text-white' :
                                    prediction.riskLevel === 'Medium' ? 'bg-risk-medium text-white' :
                                        'bg-risk-low text-white'
                                    }`}>
                                    {prediction.riskLevel} Dropout Risk
                                </div>
                                <p className="mt-4 text-xs text-muted-foreground text-center max-w-xs leading-relaxed mb-4">
                                    Based on your current behavioral patterns, your risk of dropping out is {prediction.riskLevel.toLowerCase()}.
                                </p>
                                {prediction.id && (
                                    <ExplainableAIModal predictionId={prediction.id} riskLevel={prediction.riskLevel} confidence={prediction.probability} />
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Card className="border-none shadow-md overflow-hidden flex-1">
                                <div className="bg-primary/10 px-6 py-3 flex items-center gap-2 border-b border-primary/10 font-bold text-[10px] tracking-wider uppercase text-primary">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Identified Factors
                                </div>
                                <CardContent className="p-4 px-6">
                                    <ul className="space-y-3">
                                        {prediction.reasons.map((reason, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md overflow-hidden flex-1">
                                <div className="bg-green-500/10 px-6 py-3 flex items-center gap-2 border-b border-green-500/10 font-bold text-[10px] tracking-wider uppercase text-green-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Recommended Actions
                                </div>
                                <CardContent className="p-4 px-6">
                                    <ul className="space-y-3">
                                        {prediction.suggestions.map((suggestion, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                <ChevronRight className="h-3.5 w-3.5 text-primary" />
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600 font-medium text-sm"
                    >
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </motion.div>
                )}

                {/* Profile Card Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg uppercase tracking-wider text-muted-foreground font-bold">Student Profile Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <span className="font-medium">{dashboardData?.fullName || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Roll Number</span>
                                    <span className="font-medium">{dashboardData?.rollNumber || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Registration</span>
                                    <span className="font-medium">{dashboardData?.registrationNumber || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Department</span>
                                    <span className="font-medium">{dashboardData?.department || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-sm text-muted-foreground">Semester</span>
                                    <span className="font-medium">{dashboardData?.semester || "Not specified"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-lg uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Journey Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-[calc(100%-70px)]">
                            <div>
                                <p className="text-foreground font-medium mb-4">Track your entire academic progress chronologically.</p>
                                <ul className="space-y-4 mb-6">
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-primary" /> See Risk Adjustments
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-primary" /> View Milestone Badges
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-primary" /> Review Teacher Notes & Messages
                                    </li>
                                </ul>
                            </div>
                            <Button className="w-full shadow-md mt-auto group-hover:bg-primary/90 transition-colors" onClick={() => router.push('/dashboard/student/timeline')}>
                                View Full Timeline <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
