import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function TeacherAnalyticsPage() {
    return (
        <DashboardLayout role="teacher">
            <div className="p-4 sm:p-6 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Department Analytics</h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">
                        Monitor student risk trends and manage early intervention programs for your department.
                    </p>
                </div>
                
                <AnalyticsView />
            </div>
        </DashboardLayout>
    );
}
