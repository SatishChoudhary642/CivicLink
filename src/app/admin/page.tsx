
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getIssues } from "@/lib/data";

export default async function AdminPage() {
    const allIssues = await getIssues();
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-screen">
             <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Monitor and manage all reported civic issues.
                </p>
            </header>
            <AdminDashboard allIssues={allIssues} />
        </div>
    );
}
