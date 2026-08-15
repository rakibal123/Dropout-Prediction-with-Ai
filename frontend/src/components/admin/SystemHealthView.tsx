"use client";

import { useState, useEffect } from "react";
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { Loader2, Server, Database, Brain, Activity, Clock, Users, HardDrive, Cpu, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function SystemHealthView() {
    const [health, setHealth] = useState<any>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchHealth = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/system-health`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setHealth(json.data);
            setLastUpdated(new Date());
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Auto refresh every 30 seconds
        const interval = setInterval(() => {
            fetchHealth();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !health) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-red-500">
                <AlertCircle className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Failed to load system health</h2>
                <p>The backend services may be down.</p>
            </div>
        );
    }

    const StatusBadge = ({ status }: { status: string }) => {
        const isOnline = status === 'Online';
        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {isOnline ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {status}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-12">
            
            {/* Auto Refresh indicator */}
            <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                    <span>Auto-refreshing every 30s</span>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    Last check: {lastUpdated.toLocaleTimeString()}
                </div>
            </div>

            {/* Core Services Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <Server className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">Node.js API</p>
                                <h3 className="text-lg font-bold">Main Backend</h3>
                            </div>
                        </div>
                        <StatusBadge status={health.status.backend} />
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">FastAPI ML</p>
                                <h3 className="text-lg font-bold">Prediction Engine</h3>
                            </div>
                        </div>
                        <StatusBadge status={health.status.fastApi} />
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">MongoDB</p>
                                <h3 className="text-lg font-bold">Primary Database</h3>
                            </div>
                        </div>
                        <StatusBadge status={health.status.database} />
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { label: "Uptime", value: health.performance.serverUptime, icon: Clock },
                    { label: "API Requests", value: health.performance.apiRequestsToday, icon: Activity },
                    { label: "Avg Response", value: health.performance.avgResponseTime, icon: Zap },
                    { label: "CPU Usage", value: health.performance.cpuUsage, icon: Cpu },
                    { label: "Memory Usage", value: health.performance.memoryUsage, icon: HardDrive },
                    { label: "Active Users", value: health.activity.currentActiveUsers, icon: Users },
                ].map((stat, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <stat.icon className="w-5 h-5 text-primary mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Database Collections */}
                <Card className="border-border shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Database Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Total Database Size</span>
                                <span className="font-bold">{health.databaseInfo.size}</span>
                            </div>
                            {[
                                { k: 'Students', v: health.databaseInfo.collections.students },
                                { k: 'Teachers', v: health.databaseInfo.collections.teachers },
                                { k: 'Behavior Records', v: health.databaseInfo.collections.behaviorRecords },
                                { k: 'Predictions', v: health.databaseInfo.collections.predictions },
                                { k: 'Messages', v: health.databaseInfo.collections.messages },
                                { k: 'Notifications', v: health.databaseInfo.collections.notifications },
                            ].map(item => (
                                <div key={item.k} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{item.k}</span>
                                    <span className="font-bold font-mono">{item.v.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Machine Learning Status */}
                <Card className="border-border shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Brain className="w-5 h-5 text-purple-500" /> Machine Learning Engine</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { k: 'Active Model', v: health.mlStatus.modelName },
                                { k: 'Last Trained', v: health.mlStatus.trainingDate },
                                { k: 'Total Predictions Executed', v: health.mlStatus.predictionCount.toLocaleString() },
                                { k: 'Avg Inference Time', v: health.mlStatus.avgPredictionTime },
                                { k: 'Model Accuracy', v: health.mlStatus.accuracy },
                            ].map(item => (
                                <div key={item.k} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{item.k}</span>
                                    <span className={`font-bold ${item.k === 'Model Accuracy' ? 'text-green-500' : ''}`}>{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* API Response Time Chart */}
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-muted-foreground">API Response Time (ms)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={health.chartData.responseTime}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="ms" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Prediction Requests Chart */}
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-muted-foreground">Daily Prediction Volume & Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={health.chartData.predictions}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" domain={[90, 100]} axisLine={false} tickLine={false} />
                                <RechartsTooltip />
                                <Line yAxisId="left" type="monotone" dataKey="count" name="Total Predictions" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
                                <Line yAxisId="right" type="monotone" dataKey="successRate" name="Success %" stroke="#10b981" strokeDasharray="5 5" strokeWidth={3} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Global Feature Importance Chart */}
                <Card className="border-border shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base text-muted-foreground">Global Feature Importance (XAI)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={health.chartData.globalFeatureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="feature" axisLine={false} tickLine={false} width={120} />
                                <RechartsTooltip cursor={{fill: 'var(--color-secondary)'}} />
                                <Bar dataKey="importance" name="Relative Importance" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

            {/* System Logs */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-muted-foreground">Recent System Alerts & Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {health.logs.length === 0 ? (
                            <p className="p-6 text-center text-muted-foreground">No recent alerts. System is stable.</p>
                        ) : (
                            health.logs.map((log: any, i: number) => (
                                <div key={i} className="p-4 px-6 flex items-start gap-4 hover:bg-secondary/30 transition-colors">
                                    <div className="mt-1">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-semibold text-sm">{log.type}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

// Just an icon mock for Zap since I forgot to import it from lucide-react initially
const Zap = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
