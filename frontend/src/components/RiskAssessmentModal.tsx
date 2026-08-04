"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight, ArrowLeft, GraduationCap, Users, FileText, Brain, Clock, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";

interface RiskAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RiskAssessmentData) => void;
    isLoading: boolean;
}

export interface RiskAssessmentData {
    attendance: number;
    submissionRate: number;
    ctMark: number;
    studyHours: number;
}

export function RiskAssessmentModal({ isOpen, onClose, onSubmit, isLoading }: RiskAssessmentModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<RiskAssessmentData>({
        attendance: 85,
        submissionRate: 80,
        ctMark: 75,
        studyHours: 15
    });

    const totalSteps = 2;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            onSubmit(formData);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (key: keyof RiskAssessmentData, value: number) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="w-full max-w-lg"
                    >
                        <Card className="border border-white/10 shadow-2xl bg-slate-950/90 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-white/5 pb-6 relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Zap className="h-6 w-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white tracking-tight">AI Risk Assessment</CardTitle>
                                        <p className="text-xs text-slate-400">Step {step} of {totalSteps} • Step-by-step evaluation</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                                    <motion.div
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                variants={stepVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="space-y-8"
                                            >
                                                <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3">
                                                    <GraduationCap className="h-5 w-5 text-primary mt-1 shrink-0" />
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        We'll start with your core academic engagement. This helps our AI establish your baseline performance level.
                                                    </p>
                                                </div>
                                                <div className="space-y-8">
                                                    <Slider
                                                        label="Attendance Rate"
                                                        min={0}
                                                        max={100}
                                                        value={formData.attendance}
                                                        onChange={(val) => handleChange("attendance", val)}
                                                    />
                                                    <Slider
                                                        label="Assignment Submission"
                                                        min={0}
                                                        max={100}
                                                        value={formData.submissionRate}
                                                        onChange={(val) => handleChange("submissionRate", val)}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                variants={stepVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="space-y-8"
                                            >
                                                <div className="bg-purple-500/5 p-4 rounded-lg flex items-start gap-3">
                                                    <Brain className="h-5 w-5 text-purple-400 mt-1 shrink-0" />
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        Next, let's look at your class test scores. This provides a direct measure of your academic grasp on the topics.
                                                    </p>
                                                </div>
                                                <div className="space-y-8">
                                                    <Slider
                                                        label="CT Mark"
                                                        min={0}
                                                        max={100}
                                                        value={formData.ctMark}
                                                        onChange={(val) => handleChange("ctMark", val)}
                                                    />
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm font-semibold text-slate-300">Study Hours (Weekly)</label>
                                                            <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">INTENSIVE</span>
                                                        </div>
                                                        <Slider
                                                            min={0}
                                                            max={168}
                                                            value={formData.studyHours}
                                                            onChange={(val) => handleChange("studyHours", val)}
                                                            unit=" hrs"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}


                                    </AnimatePresence>

                                    <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-8">
                                        {step > 1 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleBack}
                                                className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
                                                disabled={isLoading}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={onClose}
                                                className="flex-1 text-slate-500 hover:text-white"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                            isLoading={isLoading}
                                        >
                                            {step === totalSteps ? (
                                                "Analyze Profile"
                                            ) : (
                                                <>
                                                    Next Step
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
