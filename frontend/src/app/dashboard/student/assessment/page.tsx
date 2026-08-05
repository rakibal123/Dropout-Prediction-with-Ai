"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Zap, Loader2, ArrowLeft, Brain, BookOpen, Clock, Activity, Target } from "lucide-react";
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
        formState: { errors, isSubmitting }
    } = useForm<AssessmentFormData>({
        mode: "onTouched"
    });

    const onSubmit = async (data: AssessmentFormData) => {
        try {
            // Simulated delay for UI purposes (backend integration later)
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("Assessment Data:", data);
            
            showToast("Risk assessment data submitted successfully!", "success");
            
            // Navigate back to dashboard after simulated success
            router.push("/dashboard/student");
        } catch (error) {
            showToast("An error occurred while submitting the assessment.", "error");
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Risk Assessment</h1>
                        <p className="text-muted-foreground">Complete this comprehensive behavior profile to get your precise dropout risk prediction.</p>
                    </div>
                </div>

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
                                            max: { value: 168, message: "Cannot exceed hours in a week" },
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
        </DashboardLayout>
    );
}
