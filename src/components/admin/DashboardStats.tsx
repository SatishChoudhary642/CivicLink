"use client";

import type { Issue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DashboardStatsProps {
    issues: Issue[];
}

export function DashboardStats({ issues }: DashboardStatsProps) {
    const totalReports = issues.length;
    const pending = issues.filter(i => i.status === 'Open').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const completed = issues.filter(i => i.status === 'Resolved').length;

    const stats = [
        { title: "Total Reports", value: totalReports, icon: FileText },
        { title: "Pending", value: pending, icon: Clock },
        { title: "In Progress", value: inProgress, icon: AlertTriangle },
        { title: "Completed", value: completed, icon: CheckCircle },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
