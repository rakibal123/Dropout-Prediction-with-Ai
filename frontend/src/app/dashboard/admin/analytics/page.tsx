import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export default function AdminAnalyticsPage() {
    return (
        <div className="p-4 sm:p-6 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Global AI Analytics Center</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                    Comprehensive view of student performance, risk distribution, and proactive interventions across all departments.
                </p>
            </div>
            
            <AnalyticsView />
        </div>
    );
}
