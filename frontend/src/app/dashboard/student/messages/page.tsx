import { MessageInterface } from "@/components/messages/MessageInterface";

export default function StudentMessagesPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground mt-1">Chat securely with your assigned teachers.</p>
            </div>
            <MessageInterface role="student" />
        </div>
    );
}
