import { SettingsView } from "@/components/profile/SettingsView";

export default function StudentSettingsPage() {
    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account preferences, security, and profile details.</p>
            </div>
            <SettingsView />
        </div>
    );
}
