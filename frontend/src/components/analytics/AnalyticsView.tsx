"use client";

import { useState, useEffect } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Loader2, TrendingUp, AlertTriangle, Users, BookOpen, Clock, Download, Plus, Bot, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const RISK_COLORS = { High: "#ef4444", Medium: "#eab308", Low: "#22c55e" };
const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

export function AnalyticsView() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [highRiskStudents, setHighRiskStudents] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [interventionForm, setInterventionForm] = useState({ type: 'Counselor Assigned', actionDetails: '', dueDate: '' });
    const [intervening, setIntervening] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [overviewRes, trendsRes, insightsRes, highRiskRes, deptsRes] = await Promise.all([
                fetch("http://localhost:5000/api/analytics/overview", { headers }),
                fetch("http://localhost:5000/api/analytics/trends", { headers }),
                fetch("http://localhost:5000/api/analytics/insights", { headers }),
                fetch("http://localhost:5000/api/analytics/high-risk", { headers }),
                fetch("http://localhost:5000/api/analytics/departments", { headers })
            ]);

            const [ov, tr, ins, hr, dp] = await Promise.all([
                overviewRes.json(), trendsRes.json(), insightsRes.json(), highRiskRes.json(), deptsRes.json()
            ]);

            setOverview(ov.data);
            setTrends(tr.data);
            setInsights(ins.data);
            setHighRiskStudents(hr.data);
            setDepartments(dp.data);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleIntervention = async () => {
        setIntervening(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/analytics/interventions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    studentId: selectedStudent.studentId,
                    type: interventionForm.type,
                    actionDetails: interventionForm.actionDetails,
                    dueDate: interventionForm.dueDate
                })
            });
            if (res.ok) {
                alert("Intervention created and student notified successfully.");
                setSelectedStudent(null);
                setInterventionForm({ type: 'Counselor Assigned', actionDetails: '', dueDate: '' });
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit intervention");
        } finally {
            setIntervening(false);
        }
    };

    const exportReport = (format: string) => {
        alert(`Generating ${format.toUpperCase()} Report... This will download shortly.`);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex h-[60vh] items-center justify-center flex-col text-muted-foreground">
                <BarChart className="w-16 h-16 opacity-20 mb-4" />
                <p>No analytics data available for your scope.</p>
            </div>
        );
    }

    const riskPieData = [
        { name: "High Risk", value: overview.highRiskStudents },
        { name: "Medium Risk", value: overview.mediumRiskStudents },
        { name: "Low Risk", value: overview.lowRiskStudents }
    ];

    return (
        <div className="space-y-8 pb-12">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">AI Engine is actively monitoring {overview.totalAssessments} student records.</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                        <Download className="w-4 h-4 mr-2" /> PDF Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                        <Download className="w-4 h-4 mr-2" /> CSV Export
                    </Button>
                </div>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /> <span className="text-sm font-semibold uppercase text-muted-foreground">Students Evaluated</span></div>
                    <p className="text-3xl font-bold">{overview.totalAssessments}</p>
                </div>
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-500" /> <span className="text-sm font-semibold uppercase text-muted-foreground">Improved Trend</span></div>
                    <p className="text-3xl font-bold text-green-500">{overview.improvedStudents}</p>
                </div>
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" /> <span className="text-sm font-semibold uppercase text-muted-foreground">Immediate Attention</span></div>
                    <p className="text-3xl font-bold text-red-500">{overview.studentsNeedingImmediateAttention}</p>
                </div>
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Bot className="w-4 h-4 text-purple-500" /> <span className="text-sm font-semibold uppercase text-muted-foreground">ML Confidence</span></div>
                    <p className="text-3xl font-bold text-purple-500">{overview.averageConfidenceScore}%</p>
                </div>
            </div>

            {/* AI Insights & High Risk Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Insights Generator */}
                <div className="lg:col-span-1 bg-gradient-to-br from-card to-primary/5 rounded-xl border border-primary/20 p-6 shadow-sm flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> AI Generated Insights
                    </h3>
                    <div className="space-y-4 flex-1">
                        {insights.map((insight, idx) => (
                            <div key={idx} className={`p-4 rounded-lg text-sm font-medium border ${
                                insight.type === 'alert' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                insight.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                insight.type === 'warning' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            }`}>
                                {insight.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Early Warning System */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" /> Early Warning System
                    </h3>
                    <div className="overflow-x-auto flex-1 border border-border rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Core Reason</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {highRiskStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No high-risk students detected.</td>
                                    </tr>
                                ) : (
                                    highRiskStudents.map((hr, idx) => (
                                        <tr key={idx} className="hover:bg-secondary/20">
                                            <td className="px-4 py-3 font-medium">{hr.fullName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{hr.department || 'N/A'}</td>
                                            <td className="px-4 py-3 text-red-500 truncate max-w-xs">{hr.reason}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="sm" onClick={() => setSelectedStudent(hr)}>Intervene</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Overall Risk Distribution (Pie) */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col items-center">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4 w-full">Risk Distribution</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {riskPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'High Risk' ? RISK_COLORS.High : entry.name === 'Medium Risk' ? RISK_COLORS.Medium : RISK_COLORS.Low} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Department-wise Risk (Bar) */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm lg:col-span-2">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Department Risk Heatmap</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={departments}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="department" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} />
                            <Legend />
                            <Bar dataKey="High" stackId="a" fill={RISK_COLORS.High} />
                            <Bar dataKey="Medium" stackId="a" fill={RISK_COLORS.Medium} />
                            <Bar dataKey="Low" stackId="a" fill={RISK_COLORS.Low} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Monthly Trend (Line) */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm lg:col-span-2">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">6-Month Academic Trend</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trends.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" domain={[0, 100]} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} axisLine={false} tickLine={false} />
                            <RechartsTooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="attendance" name="Attendance %" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
                            <Line yAxisId="left" type="monotone" dataKey="submission" name="Submission %" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                            <Line yAxisId="right" type="monotone" dataKey="stress" name="Avg Stress (0-10)" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{r:4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 4. Confidence Distribution */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col items-center">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4 w-full">ML Confidence Levels</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={trends.confidenceDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} width={80} />
                            <RechartsTooltip cursor={{fill: 'var(--color-secondary)'}} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                {trends.confidenceDistribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. Study Hours (Area) */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm lg:col-span-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Study Hours Distribution vs Success</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends.studyHoursDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="range" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="count" name="Number of Students" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Intervention Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-6 border-b border-border bg-red-500/10 text-red-500">
                            <h3 className="font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Intervention Required</h3>
                            <p className="text-sm mt-1 text-foreground">For: {selectedStudent.fullName} ({selectedStudent.department})</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-secondary/30 p-3 rounded-lg border border-border text-sm">
                                <span className="font-bold text-muted-foreground block mb-1 uppercase text-xs">ML Recommendation</span>
                                {selectedStudent.recommendedAction}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Intervention Type</label>
                                <select 
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                    value={interventionForm.type}
                                    onChange={(e) => setInterventionForm({...interventionForm, type: e.target.value})}
                                >
                                    <option>Counselor Assigned</option>
                                    <option>Teacher Mentor Assigned</option>
                                    <option>Follow-up Scheduled</option>
                                    <option>Academic Note Added</option>
                                    <option>Improvement Plan Created</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Action Details</label>
                                <textarea 
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[100px]"
                                    placeholder="Provide detailed instructions or notes..."
                                    value={interventionForm.actionDetails}
                                    onChange={(e) => setInterventionForm({...interventionForm, actionDetails: e.target.value})}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Follow-up / Due Date</label>
                                <input 
                                    type="date"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                    value={interventionForm.dueDate}
                                    onChange={(e) => setInterventionForm({...interventionForm, dueDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-2 bg-secondary/20">
                            <Button variant="ghost" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                            <Button onClick={handleIntervention} disabled={intervening}>
                                {intervening && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Issue Intervention
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
