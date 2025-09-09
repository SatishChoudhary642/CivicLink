
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Issue, IssueStatus, Priority } from "@/lib/types";
import { issueCategories } from "@/lib/data";
import { predictIssuePriority } from "@/ai/flows/predict-issue-priority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DashboardStats } from "./DashboardStats";
import { ReportDetails } from "./ReportDetails";
import { Search } from "lucide-react";

interface AdminDashboardProps {
  allIssues: Issue[];
}

export function AdminDashboard({ allIssues }: AdminDashboardProps) {
  const [issuesWithPriority, setIssuesWithPriority] = useState<Issue[]>(allIssues);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    setIssuesWithPriority(allIssues);
    
    const assessPriorities = async () => {
      const issuesToAssess = allIssues.filter(issue => !issue.priority);
      if (issuesToAssess.length === 0) return;

      const priorityPromises = issuesToAssess.map(issue => 
        predictIssuePriority({
          title: issue.title,
          description: issue.description,
          category: issue.category
        }).then(priorityResult => ({
          issueId: issue.id,
          ...priorityResult
        }))
      );

      const results = await Promise.all(priorityPromises);

      const newIssues = allIssues.map(issue => {
        const foundResult = results.find(res => res.issueId === issue.id);
        if (foundResult) {
          return {
            ...issue,
            priority: foundResult.priority,
            priorityJustification: foundResult.justification
          }
        }
        return issue;
      });
      setIssuesWithPriority(newIssues);
    };

    assessPriorities();
  }, [allIssues]);
  
  const statuses: IssueStatus[] = ["Open", "In Progress", "Resolved", "Rejected"];
  const priorities: Priority[] = ["High", "Medium", "Low"];

  const filteredIssues = useMemo(() => {
    return issuesWithPriority.filter((issue) => {
      const statusMatch = statusFilter === "All" || issue.status === statusFilter;
      const categoryMatch = categoryFilter === "All" || issue.category === categoryFilter;
      const priorityMatch = priorityFilter === "All" || issue.priority === priorityFilter;
      const searchMatch = !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && categoryMatch && priorityMatch && searchMatch;
    });
  }, [issuesWithPriority, statusFilter, categoryFilter, priorityFilter, searchQuery]);
  
  useEffect(() => {
    if (selectedIssue && !filteredIssues.some(issue => issue.id === selectedIssue.id)) {
        setSelectedIssue(null);
    }
  }, [selectedIssue, filteredIssues]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Open': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPriorityClasses = (priority?: Priority) => {
      switch (priority) {
          case 'High': return 'bg-red-500 text-white';
          case 'Medium': return 'bg-yellow-500 text-white';
          case 'Low': return 'bg-green-500 text-white';
          default: return 'bg-gray-200 text-gray-800';
      }
  }
  
  const handleStatusChange = (issueId: string, newStatus: IssueStatus) => {
    const updatedIssues = issuesWithPriority.map((issue) =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    );
    setIssuesWithPriority(updatedIssues);
    
    if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const ReportsList = () => (
    <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-2 space-y-2">
            {filteredIssues.length > 0 ? filteredIssues.map(issue => (
                <button 
                    key={issue.id} 
                    className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedIssue?.id === issue.id 
                            ? "bg-primary/10 border-primary shadow-sm" 
                            : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedIssue(issue)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm flex-1 pr-2">{issue.title}</h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant={getStatusVariant(issue.status)} className="text-xs">{issue.status}</Badge>
                            {issue.priority && <Badge className={cn("text-xs", getPriorityClasses(issue.priority))}>{issue.priority}</Badge>}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.category}</p>
                    <p className="text-xs text-muted-foreground">{issue.location.address}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">Votes: {issue.votes.up - issue.votes.down}</p>
                      <p className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleDateString()}</p>
                    </div>
                </button>
            )) : (
                <div className="p-4 text-center text-muted-foreground">
                    No reports found.
                </div>
            )}
        </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-8">
        <DashboardStats issues={allIssues} />
        
        <Card>
            <CardContent className="p-4">
                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search reports..." 
                            className="pl-8" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {issueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Priorities</SelectItem>
                            {priorities.map(p => <SelectItem key={p} value={p}>{p} Priority</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div className={cn(selectedIssue ? "md:col-span-1 lg:col-span-1" : "col-span-full")}>
                        <ReportsList />
                    </div>
                    {selectedIssue && (
                        <div className="md:col-span-2 lg:col-span-3">
                           <ReportDetails 
                              issue={selectedIssue} 
                              onStatusChange={handleStatusChange} 
                              statuses={statuses}
                              getPriorityClasses={getPriorityClasses}
                              onClose={() => setSelectedIssue(null)}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
