
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Issue, IssueStatus, Priority } from "@/lib/types";
import { issueCategories } from "@/context/IssueContext";
import { analyzeInfrastructureGaps, type AnalyzeInfrastructureGapsOutput } from "@/ai/flows/analyze-infrastructure-gaps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DashboardStats } from "./DashboardStats";
import { ReportDetails } from "./ReportDetails";
import { Search, Lightbulb, Link as LinkIcon } from "lucide-react";
import { useIssues } from "@/context/IssueContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";


interface AdminDashboardProps {
  allIssues: Issue[];
}

export function AdminDashboard({ allIssues }: AdminDashboardProps) {
  const { updateIssue } = useIssues();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeInfrastructureGapsOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (allIssues.length > 0 && selectedIssue) {
        const updatedSelectedIssue = allIssues.find(i => i.id === selectedIssue.id);
        setSelectedIssue(updatedSelectedIssue || null);
    }
    
    const runInfrastructureAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeInfrastructureGaps({ issues: allIssues });
            setAnalysis(result);
        } catch (error) {
            console.error("Infrastructure analysis failed:", error);
            setAnalysis({ gapAnalysis: [] }); // Set empty on error
        } finally {
            setIsAnalyzing(false);
        }
    };

    runInfrastructureAnalysis();

  }, [allIssues, selectedIssue]);
  
  const statuses: IssueStatus[] = ["Open", "In Progress", "Resolved", "Rejected"];
  const priorities: Priority[] = ["High", "Medium", "Low"];

  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      const statusMatch = statusFilter === "All" || issue.status === statusFilter;
      const categoryMatch = categoryFilter === "All" || issue.category === categoryFilter;
      const priorityMatch = priorityFilter === "All" || issue.priority === priorityFilter;
      const searchMatch = !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && categoryMatch && priorityMatch && searchMatch;
    });
  }, [allIssues, statusFilter, categoryFilter, priorityFilter, searchQuery]);
  
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
    updateIssue(issueId, { status: newStatus });
    
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

  const AnalysisSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-yellow-500" />
          AI Infrastructure Analysis
        </CardTitle>
        <CardDescription>
            AI-powered suggestions based on recurring issue patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
          {isAnalyzing ? (
              <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </div>
          ) : analysis && analysis.gapAnalysis.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {analysis.gapAnalysis.map((gap, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex flex-col items-start text-left">
                        <span className="font-semibold">{gap.problemArea}: {gap.problemType}</span>
                        <span className="text-sm font-normal text-muted-foreground">{gap.suggestion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2 pl-2 border-l-2 ml-2 border-primary/50">
                        <p className="text-sm font-semibold">Reasoning:</p>
                        <p className="text-sm text-muted-foreground italic">&quot;{gap.reasoning}&quot;</p>
                        <p className="text-sm font-semibold pt-2">Supporting Reports:</p>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {gap.supportingIssueIds.map(id => {
                                const issue = allIssues.find(i => i.id === id);
                                return issue ? (
                                    <li key={id}>
                                        <Link href={`/issues/${id}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                            {issue.title} <LinkIcon className="h-3 w-3" />
                                        </Link>
                                    </li>
                                ) : null
                            })}
                        </ul>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-4 text-center text-muted-foreground border-dashed border rounded-md">
                <p>Not enough data to perform analysis.</p>
                <p className="text-xs">At least 5 reports are needed.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
        <DashboardStats issues={allIssues} />
        <AnalysisSection />
        
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
                 <div className={cn(
                    "grid grid-cols-1 gap-6",
                     selectedIssue && "lg:grid-cols-3"
                )}>
                    <div className={cn(
                        "transition-all duration-300",
                        selectedIssue ? "lg:col-span-1" : "lg:col-span-3"
                    )}>
                        <ReportsList />
                    </div>
                    {selectedIssue && (
                        <div className="lg:col-span-2">
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
