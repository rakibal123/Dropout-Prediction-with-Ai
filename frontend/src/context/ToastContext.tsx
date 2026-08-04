"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                            className={cn(
                                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-premium-lg border min-w-[300px] max-w-md",
                                toast.type === 'success' && "bg-white border-green-100 text-green-800",
                                toast.type === 'error' && "bg-white border-red-100 text-red-800",
                                toast.type === 'info' && "bg-white border-blue-100 text-blue-800"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                toast.type === 'success' && "bg-green-100 text-green-600",
                                toast.type === 'error' && "bg-red-100 text-red-600",
                                toast.type === 'info' && "bg-blue-100 text-blue-600"
                            )}>
                                {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                                {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                                {toast.type === 'info' && <Info className="h-5 w-5" />}
                            </div>

                            <p className="text-sm font-semibold flex-1 leading-tight">{toast.message}</p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Progress bar animation */}
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className={cn(
                                    "absolute bottom-0 left-0 h-1 rounded-b-2xl",
                                    toast.type === 'success' && "bg-green-500",
                                    toast.type === 'error' && "bg-red-500",
                                    toast.type === 'info' && "bg-blue-500"
                                )}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
