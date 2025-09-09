"use client";

import { useState, useEffect } from "react";
import type { Issue, IssueStatus } from "@/lib/types";
import { issueCategories } from "@/lib/data";
import { predictIssuePriority } from "@/ai/flows/predict-issue-priority";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  allIssues: Issue[];
}

export function AdminDashboard({ allIssues }: AdminDashboardProps) {
  const [issues, setIssues] = useState<Issue[]>(allIssues);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    const assessPriorities = async () => {
      const issuesToAssess = issues.filter(issue => !issue.priority);
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

      setIssues(prevIssues => 
        prevIssues.map(issue => {
          const foundResult = results.find(res => res.issueId === issue.id);
          if (foundResult) {
            return {
              ...issue,
              priority: foundResult.priority,
              priorityJustification: foundResult.justification
            }
          }
          return issue;
        })
      );
    };

    assessPriorities();
  }, []);

  const statuses: IssueStatus[] = ["Open", "In Progress", "Resolved", "Rejected"];

  const handleStatusChange = (issueId: string, newStatus: IssueStatus) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
    // In a real app, you would call a server action here to update the database
  };

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = statusFilter === "All" || issue.status === statusFilter;
    const categoryMatch = categoryFilter === "All" || issue.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPriorityClasses = (priority?: 'High' | 'Medium' | 'Low') => {
      switch (priority) {
          case 'High': return 'text-red-600 bg-red-100/60 border-red-200';
          case 'Medium': return 'text-amber-600 bg-amber-100/60 border-amber-200';
          default: return 'text-gray-500 bg-gray-100/60 border-gray-200/60';
      }
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <Card>
          <CardHeader>
              <CardTitle>Issue Management</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Filter by Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                  </Select>
              </div>
              <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Filter by Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {issueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                  </Select>
              </div>
              </div>

              <div className="rounded-lg border">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead className="w-12">Priority</TableHead>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredIssues.map((issue) => (
                      <TableRow key={issue.id} className={cn(issue.priority === 'High' && 'bg-red-50/50')}>
                      <TableCell className="text-center">
                          {issue.priority ? (
                            <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className={cn("px-2 py-1", getPriorityClasses(issue.priority))}>
                                      {issue.priority === 'High' && <AlertTriangle className="h-4 w-4" />}
                                      {issue.priority === 'Medium' && <Info className="h-4 w-4" />}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">{issue.priority} Priority</p>
                                  <p className="text-muted-foreground">{issue.priorityJustification}</p>
                                </TooltipContent>
                            </Tooltip>
                           ) : (
                               <div className="h-5 w-5 animate-spin rounded-full border-2 border-dashed border-primary" />
                           )}
                      </TableCell>
                      <TableCell className="font-medium">{issue.title}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>{issue.votes.up}</TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <p className="px-2 py-1.5 text-sm font-semibold">Change Status</p>
                              {statuses.map(status => (
                                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(issue.id, status)}>
                                      Mark as {status}
                                  </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </div>
              {filteredIssues.length === 0 && (
                  <p className="mt-8 text-center text-muted-foreground">No issues match the current filters.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
