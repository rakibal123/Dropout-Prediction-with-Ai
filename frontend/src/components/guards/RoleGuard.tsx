"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RoleGuard({ 
    children, 
    allowedRoles 
}: { 
    children: React.ReactNode, 
    allowedRoles: string[] 
}) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkRole = () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                router.replace("/login");
                return;
            }

            try {
                const user = JSON.parse(userStr);
                if (allowedRoles.includes(user.role)) {
                    setIsAuthorized(true);
                } else {
                    router.replace("/unauthorized");
                }
            } catch (error) {
                console.error("Role check failed", error);
                router.replace("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkRole();
    }, [allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}
