"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function MLSandboxModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [manualForm, setManualForm] = useState<any>({
        attendancePercentage: 80,
        assignmentSubmissionRate: 75,
        quizAverage: 70,
        ctMarks: 75,
        midtermMarks: 75,
        finalMarks: 75,
        studyHoursPerWeek: 15,
        classEngagement: 70,
        participationInActivities: 65,
        missedAssessments: 0
    });
    
    const [predictionResult, setPredictionResult] = useState<any>(null);
    const [isPredicting, setIsPredicting] = useState(false);

    const handlePredictPreview = async () => {
        setIsPredicting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/teacher/test-prediction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: manualForm })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setPredictionResult(data.data.prediction);
            }
        } catch (error) {
            console.error("Prediction failed", error);
        } finally {
            setIsPredicting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                    <Brain className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">ML Prediction Sandbox</h3>
                                    <p className="text-xs text-muted-foreground">Test the dropout risk AI with manual values</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">Sandbox Mode</p>
                                    <p className="text-xs text-blue-600/80">These values are not saved to any student's record.</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-blue-700 border-blue-300 hover:bg-blue-100" onClick={() => {
                                    setManualForm({
                                        attendancePercentage: 80, assignmentSubmissionRate: 75, quizAverage: 70, ctMarks: 75,
                                        midtermMarks: 75, finalMarks: 75, studyHoursPerWeek: 15, classEngagement: 70,
                                        participationInActivities: 65, missedAssessments: 0
                                    });
                                    setPredictionResult(null);
                                }}>
                                    Reset Values
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Attendance (%)</label><Input type="number" min="0" max="100" value={manualForm.attendancePercentage} onChange={e => setManualForm({...manualForm, attendancePercentage: e.target.value})} required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Assignment Submission (%)</label><Input type="number" min="0" max="100" value={manualForm.assignmentSubmissionRate} onChange={e => setManualForm({...manualForm, assignmentSubmissionRate: e.target.value})} required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Quiz Average</label><Input type="number" min="0" max="100" value={manualForm.quizAverage} onChange={e => setManualForm({...manualForm, quizAverage: e.target.value})} required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">CT Marks</label><Input type="number" min="0" max="100" value={manualForm.ctMarks} onChange={e => setManualForm({...manualForm, ctMarks: e.target.value})} required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Midterm Marks</label><Input type="number" min="0" max="100" value={manualForm.midtermMarks} onChange={e => setManualForm({...manualForm, midtermMarks: e.target.value})} required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Final Marks</label><Input type="number" min="0" max="100" value={manualForm.finalMarks} onChange={e => setManualForm({...manualForm, finalMarks: e.target.value})} /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Study Hours/Week</label><Input type="number" min="0" max="168" value={manualForm.studyHoursPerWeek} onChange={e => setManualForm({...manualForm, studyHoursPerWeek: e.target.value})} /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Class Engagement (0-100)</label><Input type="number" min="0" max="100" value={manualForm.classEngagement} onChange={e => setManualForm({...manualForm, classEngagement: e.target.value})} /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Participation (0-100)</label><Input type="number" min="0" max="100" value={manualForm.participationInActivities} onChange={e => setManualForm({...manualForm, participationInActivities: e.target.value})} /></div>
                                <div className="space-y-1.5"><label className="text-xs font-semibold">Missed Assessments</label><Input type="number" min="0" value={manualForm.missedAssessments} onChange={e => setManualForm({...manualForm, missedAssessments: e.target.value})} /></div>
                            </div>

                            {predictionResult && (
                                <div className="bg-secondary/30 p-4 rounded-lg mt-4 border border-border">
                                    <h4 className="font-bold text-sm mb-2">Dropout Risk Prediction</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Risk Level</p>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                predictionResult.riskLevel === "High" ? "bg-red-100 text-red-700" :
                                                predictionResult.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" :
                                                predictionResult.riskLevel === "Low" ? "bg-emerald-100 text-emerald-700" :
                                                "bg-secondary text-muted-foreground"
                                            }`}>
                                                {predictionResult.riskLevel} Risk
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Prediction Probability</p>
                                            <p className="font-semibold text-sm">
                                                {predictionResult.probability?.high ? (predictionResult.probability.high).toFixed(1) : (predictionResult.confidence).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    {predictionResult.topFactors && predictionResult.topFactors.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-muted-foreground mb-1">Feature Contribution / SHAP</p>
                                            <div className="flex flex-wrap gap-1">
                                                {predictionResult.topFactors.map((f: any, idx: number) => (
                                                    <span key={idx} className="bg-background border border-border px-2 py-1 rounded text-[10px]">
                                                        {f.feature} ({f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                <Button type="button" onClick={handlePredictPreview} isLoading={isPredicting}>Calculate Dropout Risk</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
