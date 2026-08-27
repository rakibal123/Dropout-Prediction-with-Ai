import { MessageInterface } from "@/components/messages/MessageInterface";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function StudentMessagesPage() {
    return (
        <DashboardLayout role="student">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground mt-1">Chat securely with your assigned teachers.</p>
                </div>
                <MessageInterface role="student" />
            </div>
        </DashboardLayout>
    );
}
