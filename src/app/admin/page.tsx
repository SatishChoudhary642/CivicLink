import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { issues } from "@/lib/data";

export default function AdminPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage and filter all reported civic issues.
                </p>
            </header>
            <AdminDashboard allIssues={issues} />
        </div>
    );
}
