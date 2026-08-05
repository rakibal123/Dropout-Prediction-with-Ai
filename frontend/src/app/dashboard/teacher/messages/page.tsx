import { MessageInterface } from "@/components/messages/MessageInterface";

export default function TeacherMessagesPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground mt-1">Communicate with your students and monitor their progress.</p>
            </div>
            <MessageInterface role="teacher" />
        </div>
    );
}
