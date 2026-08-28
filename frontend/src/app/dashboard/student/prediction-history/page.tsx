"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { 
    Search, Filter, ChevronLeft, ChevronRight, FileText, Download, 
    TrendingUp, ShieldCheck, Activity, Target, Zap, Clock, BookOpen, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Add missing exports for some generic UI if they don't exist, or just use raw HTML for simple elements

interface Prediction {
    _id: string;
    createdAt: string;
    finalScore: number;
    riskLevel: "Low" | "Medium" | "High" | "Critical";
    riskProbability: number;
    predictionMethod: string;
    predictionVersion: string;
    recommendation: string[];
    behaviorRecordId: {
        attendancePercentage: number;
        assignmentSubmissionRate: number;
        quizAverage: number;
        midtermMarks: number;
        studyHoursPerWeek: number;
        engagementScore: number;
        loginFrequency: number;
        participationScore: number;
        stressLevel: number;
        motivationLevel: number;
    };
}

export default function PredictionHistoryPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [allPredictions, setAllPredictions] = useState<Prediction[]>([]); // For charts and stats
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("");
    const [sort, setSort] = useState("newest");
    
    // Modal state
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
    const { showToast } = useToast();

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            
            // 1. Fetch paginated data for table
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                riskLevel: riskFilter,
                sort
            });
            const res = await fetch(`/api/student/predictions?${queryParams}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setPredictions(data.data.predictions);
                setTotalPages(data.data.pages);
            }

            // 2. Fetch ALL data (without pagination) for charts and analytics
            if (page === 1) { // Only fetch all on first load or filter change
                const allRes = await fetch(`/api/student/predictions?limit=1000`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const allData = await allRes.json();
                if (allData.success) {
                    setAllPredictions(allData.data.predictions);
                }
            }

        } catch (error) {
            showToast("Failed to load prediction history", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, [page, search, riskFilter, sort]);

    // Analytics Calculation
    const totalAssessments = allPredictions.length;
    const latestRiskLevel = allPredictions.length > 0 ? allPredictions[0].riskLevel : "N/A";
    const averageScore = totalAssessments > 0 ? Math.round(allPredictions.reduce((acc, curr) => acc + curr.finalScore, 0) / totalAssessments) : 0;
    const highestScore = totalAssessments > 0 ? Math.max(...allPredictions.map(p => p.finalScore)) : 0;
    const lowestScore = totalAssessments > 0 ? Math.min(...allPredictions.map(p => p.finalScore)) : 0;

    // Charts Data
    const lineChartData = [...allPredictions].reverse().map(p => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        score: p.finalScore
    }));

    const riskCounts = allPredictions.reduce((acc, p) => {
        acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const pieChartData = Object.keys(riskCounts).map(key => ({
        name: key,
        value: riskCounts[key],
        color: key === 'Low' ? '#10b981' : key === 'Medium' ? '#f59e0b' : '#ef4444'
    }));

    // Radar Chart uses latest prediction
    const latestBehavior = allPredictions.length > 0 ? allPredictions[0].behaviorRecordId : null;
    const radarChartData = latestBehavior ? [
        { subject: 'Attendance', A: latestBehavior.attendancePercentage, fullMark: 100 },
        { subject: 'Assignments', A: latestBehavior.assignmentSubmissionRate, fullMark: 100 },
        { subject: 'Quiz Avg', A: latestBehavior.quizAverage, fullMark: 100 },
        { subject: 'Midterms', A: latestBehavior.midtermMarks, fullMark: 100 },
        { subject: 'Study', A: Math.min((latestBehavior.studyHoursPerWeek / 80) * 100, 100), fullMark: 100 },
        { subject: 'Engagement', A: latestBehavior.engagementScore * 10, fullMark: 100 },
        { subject: 'Participation', A: latestBehavior.participationScore * 10, fullMark: 100 },
        { subject: 'Motivation', A: latestBehavior.motivationLevel * 10, fullMark: 100 },
    ] : [];

    const exportCSV = () => {
        if (allPredictions.length === 0) return;
        const headers = ["Date", "Score", "Risk Level", "Probability", "Method", "Attendance", "Study Hours", "Stress", "Motivation"];
        const rows = allPredictions.map(p => [
            new Date(p.createdAt).toISOString(),
            p.finalScore,
            p.riskLevel,
            `${p.riskProbability}%`,
            p.predictionMethod,
            p.behaviorRecordId.attendancePercentage,
            p.behaviorRecordId.studyHoursPerWeek,
            p.behaviorRecordId.stressLevel,
            p.behaviorRecordId.motivationLevel
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "prediction_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getRiskColor = (level: string) => {
        if (level === 'Low') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (level === 'Medium') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    };

    return (
        <DashboardLayout role="student">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Prediction History</h1>
                        <p className="text-muted-foreground">Track your academic risk progression over time.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="shadow-premium" onClick={() => window.print()} disabled={allPredictions.length === 0}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button variant="outline" className="shadow-premium" onClick={exportCSV} disabled={allPredictions.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Summary Analytics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-5 w-5 text-primary mb-2 opacity-70" />
                            <p className="text-sm text-muted-foreground font-medium">Total Assessments</p>
                            <h3 className="text-2xl font-bold mt-1">{totalAssessments}</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="h-5 w-5 text-primary mb-2 opacity-70" />
                            <p className="text-sm text-muted-foreground font-medium">Latest Risk</p>
                            <h3 className={`text-xl font-bold mt-1 ${getRiskColor(latestRiskLevel).split(' ')[0]}`}>{latestRiskLevel}</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Target className="h-5 w-5 text-primary mb-2 opacity-70" />
                            <p className="text-sm text-muted-foreground font-medium">Average Score</p>
                            <h3 className="text-2xl font-bold mt-1">{averageScore}</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <TrendingUp className="h-5 w-5 text-emerald-500 mb-2 opacity-70" />
                            <p className="text-sm text-muted-foreground font-medium">Highest Score</p>
                            <h3 className="text-2xl font-bold mt-1">{highestScore}</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-card/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-5 w-5 text-rose-500 mb-2 opacity-70" />
                            <p className="text-sm text-muted-foreground font-medium">Lowest Score</p>
                            <h3 className="text-2xl font-bold mt-1">{lowestScore}</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                {totalAssessments > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Line Chart */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-none shadow-premium bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" /> Risk Score Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 border-none shadow-premium bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Risk Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Radar Chart */}
                        <Card className="border-none shadow-premium bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-500" /> Latest Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full pb-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarChartData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar name="Performance" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Table Section */}
                <Card className="border-none shadow-premium bg-card overflow-hidden">
                    <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-card">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search records..." 
                                className="pl-9 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select 
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                            >
                                <option value="">All Risks</option>
                                <option value="Low">Low Risk</option>
                                <option value="Medium">Medium Risk</option>
                                <option value="High">High Risk</option>
                            </select>
                            <select 
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest_score">Highest Score</option>
                                <option value="lowest_score">Lowest Score</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date & Time</th>
                                    <th className="px-6 py-4 font-medium">Final Score</th>
                                    <th className="px-6 py-4 font-medium">Risk Level</th>
                                    <th className="px-6 py-4 font-medium">Probability</th>
                                    <th className="px-6 py-4 font-medium">Primary Recommendation</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Zap className="h-8 w-8 text-primary/40 animate-pulse mb-3" />
                                                <p>Loading history...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : predictions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <FileText className="h-12 w-12 text-primary/20 mb-3" />
                                                <h3 className="text-lg font-medium text-foreground mb-1">No prediction history found.</h3>
                                                <p className="text-sm max-w-sm mb-4">You haven't completed any risk assessments matching this criteria yet.</p>
                                                <Button variant="primary" onClick={() => window.location.href = '/dashboard/student/assessment'}>
                                                    Check My Risk
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    predictions.map((p) => (
                                        <tr key={p._id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{new Date(p.createdAt).toLocaleDateString()}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{p.finalScore}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(p.riskLevel)}`}>
                                                    {p.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full" 
                                                            style={{ width: `${p.riskProbability}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">{p.riskProbability}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-[200px]">
                                                {p.recommendation && p.recommendation.length > 0 ? p.recommendation[0] : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedPrediction(p)}>
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* View Details Modal */}
                <AnimatePresence>
                    {selectedPrediction && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-xl p-6"
                            >
                                <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold">Prediction Details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedPrediction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(selectedPrediction.riskLevel)}`}>
                                        {selectedPrediction.riskLevel} Risk
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Score</p>
                                        <p className="text-xl font-bold">{selectedPrediction.finalScore} / 100</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Probability</p>
                                        <p className="text-xl font-bold">{selectedPrediction.riskProbability}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Method</p>
                                        <p className="text-sm font-medium">{selectedPrediction.predictionMethod} (v{selectedPrediction.predictionVersion})</p>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4 mt-6">Behavior Parameters</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Attendance</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.attendancePercentage}%</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Assignments</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.assignmentSubmissionRate}%</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Quiz Avg</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.quizAverage}</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Midterm</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.midtermMarks}</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Study Hours</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.studyHoursPerWeek}h/wk</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Engagement</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.engagementScore}/10</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Logins</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.loginFrequency}/wk</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Participation</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.participationScore}/10</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Stress Level</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.stressLevel}/10</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Motivation</p>
                                        <p className="font-medium">{selectedPrediction.behaviorRecordId.motivationLevel}/10</p>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Recommendations</h3>
                                <ul className="space-y-2 mb-6">
                                    {selectedPrediction.recommendation.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button variant="outline" onClick={() => setSelectedPrediction(null)}>
                                        Close
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                
            </div>
        </DashboardLayout>
    );
}
