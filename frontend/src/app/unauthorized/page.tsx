"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card text-card-foreground p-8 rounded-xl shadow-premium max-w-md w-full text-center border border-border"
            >
                <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                
                <h1 className="text-3xl font-bold mb-3">403 - Access Denied</h1>
                
                <p className="text-muted-foreground mb-8">
                    You do not have permission to access this page. Please ensure you are logged in with the correct account type.
                </p>
                
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => window.history.back()}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
