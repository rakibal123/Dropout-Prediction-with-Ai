"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate message sending
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-outfit">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                    >
                        Get in Touch
                    </motion.h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Have questions about the Dropout Risk Prediction System? We're here to help institutions secure student futures.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                            <p className="text-slate-400">Reach out to our support team or visit our office in Mymensingh.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Email Us</p>
                                    <p className="text-sm text-slate-400">support@dropoutrisk.org.bd</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Call Us</p>
                                    <p className="text-sm text-slate-400">+8801531396247</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Location</p>
                                    <p className="text-sm text-slate-400">Rohomotpur, Mymensingh, Bangladesh</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
                            <h3 className="text-lg font-bold text-white mb-2">Institutional Support</h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                For large scale implementation and API access, please schedule a direct consultation with our technical team.
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
                            <CardContent className="p-8">
                                {submitted ? (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Send className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Message Sent!</h2>
                                        <p className="text-slate-400">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSubmitted(false)}
                                            className="mt-6"
                                        >
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input
                                                label="First Name"
                                                placeholder="Rafiq"
                                                required
                                                className="bg-slate-900/50 border-white/10"
                                            />
                                            <Input
                                                label="Last Name"
                                                placeholder="Ahmed"
                                                required
                                                className="bg-slate-900/50 border-white/10"
                                            />
                                        </div>
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="rafiq@example.com"
                                            required
                                            className="bg-slate-900/50 border-white/10"
                                        />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Message</label>
                                            <textarea
                                                className="flex w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]"
                                                placeholder="How can we help you?"
                                                required
                                            ></textarea>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
                                            isLoading={isLoading}
                                        >
                                            <MessageSquare className="mr-2 h-5 w-5" />
                                            Send Message
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>

            <footer className="mt-20 border-t border-white/5 py-12 text-center text-xs text-slate-500 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} SDRPS - Student Dropout Risk Prediction System.
            </footer>
        </div>
    );
}
