"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Mail, Activity, Download, Save, Server, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Mock settings state (in a real app, fetch from backend)
    const [settings, setSettings] = useState({
        systemName: "Student Dropout Risk Prediction System",
        collegeName: "University of Technology",
        riskThreshold: "75",
        maxAssessments: "5",
        emailNotifications: true,
        alertThreshold: "High"
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/system-logs?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data.logs);
            }
        } catch (error) {
            showToast("Failed to fetch system logs", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const handleSaveSettings = () => {
        // In a real app, send PUT /api/admin/settings
        showToast("System settings updated successfully", "success");
    };

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System Configuration</h1>
                        <p className="text-muted-foreground">Manage global settings and view system audit logs.</p>
                    </div>
                </div>

                <div className="flex border-b border-border mb-4">
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        General Settings
                        {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'logs' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        Audit Logs
                        {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                </div>

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-premium bg-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-blue-500" /> Platform Details</CardTitle>
                                <CardDescription>Configure basic platform branding and identifiers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">System Name</label>
                                    <Input value={settings.systemName} onChange={(e) => setSettings({...settings, systemName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">College / Institution Name</label>
                                    <Input value={settings.collegeName} onChange={(e) => setSettings({...settings, collegeName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Institution Logo URL</label>
                                    <Input placeholder="https://example.com/logo.png" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium bg-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /> Prediction Parameters</CardTitle>
                                <CardDescription>Control the behavior of the risk prediction engine.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Default Risk Threshold (0-100)</label>
                                    <Input type="number" value={settings.riskThreshold} onChange={(e) => setSettings({...settings, riskThreshold: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Maximum Daily Assessments Per Student</label>
                                    <Input type="number" value={settings.maxAssessments} onChange={(e) => setSettings({...settings, maxAssessments: e.target.value})} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium bg-card md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Notifications & Alerts</CardTitle>
                                <CardDescription>Manage how the system alerts teachers and admins.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                    <div>
                                        <p className="font-medium">Global Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Send automated emails for critical risk alerts.</p>
                                    </div>
                                    <button 
                                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-primary' : 'bg-slate-600'}`}
                                        onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailNotifications ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <label className="text-sm font-medium">Trigger Alerts For Risk Level:</label>
                                    <select 
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                        value={settings.alertThreshold}
                                        onChange={(e) => setSettings({...settings, alertThreshold: e.target.value})}
                                    >
                                        <option value="Critical">Critical Only</option>
                                        <option value="High">High and Critical</option>
                                        <option value="Medium">Medium, High, and Critical</option>
                                    </select>
                                </div>
                                
                                <div className="pt-4 border-t border-border flex justify-end">
                                    <Button onClick={handleSaveSettings}>
                                        <Save className="mr-2 h-4 w-4" /> Save Configuration
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <Card className="border-none shadow-premium bg-card overflow-hidden">
                        <CardHeader className="bg-secondary/10 border-b border-border flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                System Audit Logs
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Download className="mr-2 h-4 w-4" /> Export Logs
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground border-b border-border">
                                        <tr>
                                            <th className="p-4 px-6">Timestamp</th>
                                            <th className="p-4 px-6">User / Actor</th>
                                            <th className="p-4 px-6">Action</th>
                                            <th className="p-4 px-6">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {loading ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading logs...</td></tr>
                                        ) : logs.length === 0 ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No system logs found.</td></tr>
                                        ) : (
                                            logs.map((log: any) => (
                                                <tr key={log._id} className="hover:bg-secondary/10">
                                                    <td className="p-4 px-6 font-mono text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6">
                                                        {log.userId ? (
                                                            <div>
                                                                <span className="font-medium">{log.userId.fullName}</span>
                                                                <span className="text-xs text-muted-foreground block">{log.userId.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">System</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 px-6 font-medium">{log.action}</td>
                                                    <td className="p-4 px-6 font-mono text-xs">{log.ipAddress || 'Unknown'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
