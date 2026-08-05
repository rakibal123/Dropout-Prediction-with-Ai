import { MessageInterface } from "@/components/messages/MessageInterface";

export default function AdminMessagesPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Message Moderation</h1>
                <p className="text-muted-foreground mt-1">View all platform communications. (Read-only)</p>
            </div>
            <MessageInterface role="admin" />
        </div>
    );
}
