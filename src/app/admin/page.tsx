import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { issues } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-screen">
             <header className="mb-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Monitor and manage all reported civic issues.
                </p>
            </header>
            <AdminDashboard allIssues={issues} />
        </div>
    );
}
