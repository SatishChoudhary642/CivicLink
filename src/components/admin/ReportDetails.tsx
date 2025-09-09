"use client";

import type { Issue, IssueStatus, Priority } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, ChevronDown, X } from "lucide-react";

interface ReportDetailsProps {
    issue: Issue | null;
    onStatusChange: (issueId: string, newStatus: IssueStatus) => void;
    statuses: IssueStatus[];
    getPriorityClasses: (priority?: Priority) => string;
    onClose: () => void;
}

export function ReportDetails({ issue, onStatusChange, statuses, getPriorityClasses, onClose }: ReportDetailsProps) {

    if (!issue) {
        return (
            <Card className="h-full flex items-center justify-center bg-muted/30 border-dashed">
                <div className="text-center text-muted-foreground">
                    <Eye className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
                    <p className="font-medium">Select a report to view details</p>
                    <p className="text-sm">Choose a report from the list on the left to get started.</p>
                </div>
            </Card>
        );
    }
    
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
          case 'Open': return 'secondary';
          case 'In Progress': return 'default';
          case 'Resolved': return 'outline';
          case 'Rejected': return 'destructive';
          default: return 'outline';
        }
    };


    return (
        <Card className="h-full relative">
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-headline">
                        Report Details
                    </CardTitle>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Change Status <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {statuses.map(status => (
                                <DropdownMenuItem key={status} onClick={() => onStatusChange(issue.id, status)}>
                                    Mark as {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative h-64 w-full rounded-lg overflow-hidden border">
                    <Image 
                        src={issue.imageUrl}
                        alt={issue.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">{issue.title}</h2>
                    <p className="text-muted-foreground">{issue.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Category</p>
                        <p>{issue.category}</p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground">Priority</p>
                        {issue.priority ? (
                           <Badge className={getPriorityClasses(issue.priority)}>{issue.priority}</Badge>
                        ) : (
                           <p>Not yet assessed</p>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground">Status</p>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Location</p>
                        <p>{issue.location.address}</p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground">Reported By</p>
                        <p>{issue.reporter.name}</p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground">Reported On</p>
                        <p>{new Date(issue.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
