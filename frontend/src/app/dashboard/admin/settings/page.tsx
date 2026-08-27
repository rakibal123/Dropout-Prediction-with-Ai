import { SettingsView } from "@/components/profile/SettingsView";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminSettingsPage() {
    return (
        <DashboardLayout role="admin">
            <div className="p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">System Administrator Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your administrator account security and active sessions.</p>
                </div>
                <SettingsView />
            </div>
        </DashboardLayout>
    );
}
