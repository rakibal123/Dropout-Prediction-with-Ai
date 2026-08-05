import { ProfileView } from "@/components/profile/ProfileView";

export default function AdminProfilePage() {
    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Administrator Profile</h1>
                <p className="text-muted-foreground mt-1">View your administrative account information.</p>
            </div>
            <ProfileView />
        </div>
    );
}
