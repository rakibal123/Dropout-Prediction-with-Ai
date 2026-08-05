import { TimelineView } from "@/components/timeline/TimelineView";

export default function StudentTimelinePage() {
    return (
        <div className="p-4 sm:p-6 min-h-screen relative">
            <div className="mb-8 relative z-10">
                <h1 className="text-3xl font-bold tracking-tight">Academic Journey</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                    Track your entire academic progress, risk assessments, and milestones chronologically.
                </p>
            </div>
            
            <TimelineView />
        </div>
    );
}
