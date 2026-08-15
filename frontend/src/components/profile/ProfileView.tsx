"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Mail, Phone, MapPin, Building, ShieldCheck, Clock, User, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ProfileView() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center text-muted-foreground p-8">Failed to load profile.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-card rounded-xl border border-border overflow-hidden relative shadow-sm">
                <div className="h-32 bg-primary/20 absolute inset-0 -z-10"></div>
                <div className="p-6 sm:p-10 pt-20 sm:pt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
                    <img 
                        src={profile.profileImage?.includes('http') ? profile.profileImage : `http://localhost:5000${profile.profileImage === 'default.jpg' ? '/uploads/default.png' : profile.profileImage}`} 
                        alt={profile.fullName} 
                        className="w-32 h-32 rounded-full border-4 border-card object-cover shadow-md bg-secondary"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName) + '&background=random' }}
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.fullName}</h1>
                        <p className="text-muted-foreground uppercase text-sm mt-1 tracking-wider font-semibold">
                            {profile.role} {profile.department ? `• ${profile.department}` : ''}
                        </p>
                    </div>
                    <Link href={`/dashboard/${profile.role}/settings`}>
                        <Button>Edit Profile</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><Mail className="w-4 h-4"/> Email</p>
                                <p className="font-medium">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><Phone className="w-4 h-4"/> Phone Number</p>
                                <p className="font-medium">{profile.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><MapPin className="w-4 h-4"/> Address</p>
                                <p className="font-medium">{profile.address || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><Building className="w-4 h-4"/> Emergency Contact</p>
                                <p className="font-medium">{profile.emergencyContact || 'Not provided'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground mb-1">Short Bio</p>
                                <p className="font-medium bg-secondary/30 p-3 rounded-lg text-sm">{profile.shortBio || 'No biography provided.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Academic / Professional Info */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building className="w-5 h-5 text-primary" /> 
                            {profile.role === 'student' ? 'Academic Information' : 'Professional Information'}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {profile.role === 'student' && (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
                                        <p className="font-medium">{profile.rollNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                                        <p className="font-medium">{profile.registrationNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Semester</p>
                                        <p className="font-medium">{profile.semester || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                            {(profile.role === 'teacher' || profile.role === 'admin') && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                                    <p className="font-medium">{profile.employeeId || 'N/A'}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Department</p>
                                <p className="font-medium">{profile.department || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Preferred Language</p>
                                <p className="font-medium">{profile.preferredLanguage || 'English'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Account Status */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" /> Account Summary
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${profile.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {profile.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Visibility</span>
                                <span className="text-sm font-medium">{profile.profileVisibility || 'Institute Only'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Registered On</span>
                                <span className="text-sm font-medium">{format(new Date(profile.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Last Login</span>
                                <span className="text-sm font-medium">{profile.lastLogin ? format(new Date(profile.lastLogin), 'MMM d, yyyy HH:mm') : 'Never'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Student Specific Stats */}
                    {profile.role === 'student' && (
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-primary" /> System Insights
                            </h2>
                            <div className="text-center p-4 bg-secondary/30 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Keep track of your risk assessments in the Dashboard tab.</p>
                                <Link href="/dashboard/student/prediction-history">
                                    <Button variant="ghost" className="px-0 text-primary hover:bg-transparent hover:underline">View Prediction History</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
