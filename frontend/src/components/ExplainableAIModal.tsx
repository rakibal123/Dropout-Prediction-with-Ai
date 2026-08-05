"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Brain, HelpCircle, Activity, TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface XAIModalProps {
    predictionId: string;
    riskLevel: string;
    confidence: number;
}

export function ExplainableAIModal({ predictionId, riskLevel, confidence }: XAIModalProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && !data) {
            fetchExplanation();
        }
    }, [open]);

    const fetchExplanation = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/predictions/${predictionId}/charts`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to load XAI explanation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                    <Brain className="h-4 w-4 mr-2" />
                    Explain AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] border-none shadow-premium-lg">
                <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Brain className="h-6 w-6 text-primary" />
                        AI Prediction Explanation
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Understand the factors behind your machine learning risk assessment.
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Activity className="h-10 w-10 text-primary animate-pulse" />
                            <p className="text-sm font-medium text-muted-foreground">Analyzing neural pathways...</p>
                        </div>
                    ) : data ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                                    riskLevel === 'High' ? 'bg-risk-high/10 border-risk-high/20' :
                                    riskLevel === 'Medium' ? 'bg-risk-medium/10 border-risk-medium/20' :
                                    'bg-risk-low/10 border-risk-low/20'
                                }`}>
                                    {riskLevel === 'High' ? <ShieldAlert className="h-8 w-8 text-risk-high mb-2" /> :
                                     riskLevel === 'Medium' ? <Activity className="h-8 w-8 text-risk-medium mb-2" /> :
                                     <CheckCircle2 className="h-8 w-8 text-risk-low mb-2" />}
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Risk Gauge</p>
                                    <h3 className={`text-2xl font-black ${
                                        riskLevel === 'High' ? 'text-risk-high' :
                                        riskLevel === 'Medium' ? 'text-risk-medium' :
                                        'text-risk-low'
                                    }`}>{riskLevel} Risk</h3>
                                </div>

                                <div className="p-4 rounded-xl border bg-secondary/30 border-border flex flex-col items-center justify-center text-center">
                                    <TrendingUp className="h-8 w-8 text-primary mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Confidence Meter</p>
                                    <h3 className="text-2xl font-black text-foreground">{confidence}%</h3>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="border border-border rounded-xl p-4 bg-card">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Feature Contribution Chart
                                </h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={120} />
                                            <Tooltip
                                                cursor={{ fill: 'var(--color-secondary)' }}
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                            />
                                            <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={20}>
                                                {
                                                    data.featureImportance.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.direction === 'Positive' ? 'hsl(var(--risk-low))' : 'hsl(var(--risk-high))'} />
                                                    ))
                                                }
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-risk-low"></div> Reduces Risk</div>
                                    <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-risk-high"></div> Increases Risk</div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="p-4 bg-red-500/10 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Could not load explanation data.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
