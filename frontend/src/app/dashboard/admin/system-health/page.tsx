import { SystemHealthView } from "@/components/admin/SystemHealthView";

export default function AdminSystemHealthPage() {
    return (
        <div className="p-4 sm:p-6 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">System Health Monitor</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                    Real-time monitoring of Node.js backend, FastAPI Machine Learning service, and MongoDB database.
                </p>
            </div>
            
            <SystemHealthView />
        </div>
    );
}
