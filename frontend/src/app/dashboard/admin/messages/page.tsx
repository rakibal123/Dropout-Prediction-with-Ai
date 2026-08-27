import { MessageInterface } from "@/components/messages/MessageInterface";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminMessagesPage() {
    return (
        <DashboardLayout role="admin">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Message Moderation</h1>
                    <p className="text-muted-foreground mt-1">View all platform communications. (Read-only)</p>
                </div>
                <MessageInterface role="admin" />
            </div>
        </DashboardLayout>
    );
}
