"use client";

import { useState, useEffect } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Zap, Loader2, ArrowLeft, Brain, BookOpen, Clock, Activity, Target, TrendingUp, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";

type AssessmentFormData = {
    attendancePercentage: number;
    assignmentSubmissionRate: number;
    quizAverage: number;
    midtermMarks: number;
    studyHoursPerWeek: number;
    classEngagement: number;
    loginFrequency: number;
    participationInActivities: number;
    stressLevel: number;
    academicMotivation: number;
};

export default function RiskAssessmentPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<AssessmentFormData>({
        mode: "onTouched"
    });

    const [preview, setPreview] = useState<any>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const formData = watch();

    const onSubmit = async (data: AssessmentFormData) => {
        setIsPreviewLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            const payload = {
                attendancePercentage: data.attendancePercentage,
                assignmentSubmissionRate: data.assignmentSubmissionRate,
                quizAverage: data.quizAverage,
                midtermMarks: data.midtermMarks,
                studyHoursPerWeek: data.studyHoursPerWeek,
                engagementScore: Math.max(1, Math.min(10, data.classEngagement / 10)),
                loginFrequency: data.loginFrequency,
                participationScore: Math.max(1, Math.min(10, data.participationInActivities / 10)),
                stressLevel: data.stressLevel,
                motivationLevel: data.academicMotivation,
            };

            // 1. Submit Behavior Data
            const behaviorRes = await fetch(`/api/student/behavior`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!behaviorRes.ok) {
                const err = await behaviorRes.json();
                throw new Error(err.message || "Failed to save behavior");
            }
            
            const behaviorData = await behaviorRes.json();
            
            // 2. Run Actual ML Prediction
            const predictRes = await fetch(`/api/student/predict`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ behaviorRecordId: behaviorData.behaviorRecordId })
            });

            if (!predictRes.ok) {
                const errData = await predictRes.json().catch(() => null);
                throw new Error(errData?.message || "ML Prediction failed");
            }
            
            const predictData = await predictRes.json();
            
            // 3. Update the UI with real ML results!
            setPreview({
                probability: Math.round(predictData.mlResponse?.prediction?.confidence || predictData.finalScore || 0),
                riskLevel: predictData.riskLevel || 'Unknown',
                topFactors: predictData.mlResponse?.explanation?.topFactors || []
            });
            
            showToast("Risk assessment analyzed successfully!", "success");
            
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "An error occurred while analyzing risk profile.", "error");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Risk Assessment</h1>
                        <p className="text-muted-foreground">Complete this comprehensive behavior profile to get your precise dropout risk prediction.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-secondary/10">
                            <CardHeader className="border-b border-border bg-primary/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Zap className="h-5 w-5 animate-pulse" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Behavioral Profile</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Please provide accurate data to ensure the highest prediction accuracy.</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    
                                    {/* Section 1: Academic Performance */}
                                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 border-b border-border pb-2 mb-2 mt-4">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Academic Performance</h3>
                                    </div>

                                    <Input
                                        type="number"
                                        label="Attendance Percentage (%)"
                                        placeholder="e.g., 85"
                                        error={errors.attendancePercentage?.message}
                                        {...register("attendancePercentage", {
                                            required: "Attendance percentage is required",
                                            min: { value: 0, message: "Minimum is 0%" },
                                            max: { value: 100, message: "Maximum is 100%" },
                                            valueAsNumber: true
                                        })}
                                    />
                                    
                                    <Input
                                        type="number"
                                        label="Assignment Submission Rate (%)"
                                        placeholder="e.g., 90"
                                        error={errors.assignmentSubmissionRate?.message}
                                        {...register("assignmentSubmissionRate", {
                                            required: "Assignment submission rate is required",
                                            min: { value: 0, message: "Minimum is 0%" },
                                            max: { value: 100, message: "Maximum is 100%" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Quiz Average (Out of 100)"
                                        placeholder="e.g., 75"
                                        error={errors.quizAverage?.message}
                                        {...register("quizAverage", {
                                            required: "Quiz average is required",
                                            min: { value: 0, message: "Minimum is 0" },
                                            max: { value: 100, message: "Maximum is 100" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Midterm Marks (Out of 100)"
                                        placeholder="e.g., 80"
                                        error={errors.midtermMarks?.message}
                                        {...register("midtermMarks", {
                                            required: "Midterm marks are required",
                                            min: { value: 0, message: "Minimum is 0" },
                                            max: { value: 100, message: "Maximum is 100" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    {/* Section 2: Engagement & Effort */}
                                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 border-b border-border pb-2 mb-2 mt-4">
                                        <Activity className="h-4 w-4 text-purple-500" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Engagement & Effort</h3>
                                    </div>

                                    <Input
                                        type="number"
                                        label="Study Hours Per Week"
                                        placeholder="e.g., 15"
                                        error={errors.studyHoursPerWeek?.message}
                                        {...register("studyHoursPerWeek", {
                                            required: "Study hours are required",
                                            min: { value: 0, message: "Cannot be negative" },
                                            max: { value: 80, message: "Cannot exceed 80 hours" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Class Engagement (0 - 100)"
                                        placeholder="e.g., 60"
                                        error={errors.classEngagement?.message}
                                        {...register("classEngagement", {
                                            required: "Class engagement is required",
                                            min: { value: 0, message: "Minimum is 0" },
                                            max: { value: 100, message: "Maximum is 100" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Learning Platform Login Frequency (per week)"
                                        placeholder="e.g., 10"
                                        error={errors.loginFrequency?.message}
                                        {...register("loginFrequency", {
                                            required: "Login frequency is required",
                                            min: { value: 0, message: "Cannot be negative" },
                                            max: { value: 100, message: "Unusually high frequency" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Participation in Activities (0 - 100)"
                                        placeholder="e.g., 50"
                                        error={errors.participationInActivities?.message}
                                        {...register("participationInActivities", {
                                            required: "Participation metric is required",
                                            min: { value: 0, message: "Minimum is 0" },
                                            max: { value: 100, message: "Maximum is 100" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    {/* Section 3: Psychological Factors */}
                                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 border-b border-border pb-2 mb-2 mt-4">
                                        <Brain className="h-4 w-4 text-orange-500" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Psychological Factors</h3>
                                    </div>

                                    <Input
                                        type="number"
                                        label="Stress Level (1 - 10)"
                                        placeholder="e.g., 5"
                                        error={errors.stressLevel?.message}
                                        {...register("stressLevel", {
                                            required: "Stress level is required",
                                            min: { value: 1, message: "Minimum is 1" },
                                            max: { value: 10, message: "Maximum is 10" },
                                            valueAsNumber: true
                                        })}
                                    />

                                    <Input
                                        type="number"
                                        label="Academic Motivation (1 - 10)"
                                        placeholder="e.g., 8"
                                        error={errors.academicMotivation?.message}
                                        {...register("academicMotivation", {
                                            required: "Academic motivation is required",
                                            min: { value: 1, message: "Minimum is 1" },
                                            max: { value: 10, message: "Maximum is 10" },
                                            valueAsNumber: true
                                        })}
                                    />

                                </div>
                            </CardContent>
                            
                            <CardFooter className="bg-secondary/20 pt-6 flex justify-end gap-4 border-t border-border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="shadow-premium min-w-[150px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Target className="mr-2 h-4 w-4" />
                                            Analyze Risk Profile
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
                </div>
                
                {/* Real-time Preview Pane */}
                <div className="lg:col-span-1">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="sticky top-6">
                        <Card className="border-none shadow-premium-lg overflow-hidden bg-gradient-to-br from-card to-primary/5 h-full">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Real-time Prediction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isPreviewLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground animate-pulse">Analyzing behavior with ML...</p>
                                    </div>
                                ) : !preview ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <ShieldCheck className="h-12 w-12 text-primary/20 mb-4" />
                                        <p className="text-sm text-muted-foreground">Start filling out the form to see your real-time dropout risk prediction.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
                                        <div className="flex flex-col items-center justify-center pt-4">
                                            <div className="text-5xl font-black text-primary mb-2">
                                                {preview.probability}%
                                            </div>
                                            <div className={`text-xs font-bold px-4 py-1 rounded-full ${preview.riskLevel === 'High' ? 'bg-risk-high text-white' :
                                                preview.riskLevel === 'Medium' ? 'bg-risk-medium text-white' :
                                                    'bg-risk-low text-white'
                                                }`}>
                                                {preview.riskLevel} Risk
                                            </div>
                                            <p className="mt-3 text-xs text-muted-foreground text-center">
                                                Based on your input, your risk of dropping out is {preview.riskLevel.toLowerCase()}.
                                            </p>
                                        </div>
                                        
                                        {preview.topFactors && preview.topFactors.length > 0 && (
                                            <div className="bg-secondary/30 rounded-xl p-4">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Key Factors</h4>
                                                <ul className="space-y-2">
                                                    {preview.topFactors.map((factor: any, idx: number) => (
                                                        <li key={idx} className="text-sm flex justify-between">
                                                            <span className="font-medium text-foreground">{factor.feature}</span>
                                                            <span className="text-muted-foreground">{factor.impact} impact</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                </div>
            </div>
        </DashboardLayout>
    );
}
