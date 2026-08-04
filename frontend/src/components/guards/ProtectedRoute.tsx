"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/login");
                return;
            }

            try {
                // Check token validity with backend
                const response = await fetch("http://localhost:5000/api/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Update user state if needed
                    localStorage.setItem("user", JSON.stringify(data.data));
                    setIsAuthenticated(true);
                } else {
                    // Token expired or invalid
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.replace("/login");
                }
            } catch (error) {
                console.error("Auth verification failed", error);
                router.replace("/login");
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
