import { ProfileView } from "@/components/profile/ProfileView";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function StudentProfilePage() {
    return (
        <DashboardLayout role="student">
            <div className="p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">View your academic and personal information.</p>
                </div>
                <ProfileView />
            </div>
        </DashboardLayout>
    );
}
