"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Issue, User } from "@/lib/types";
import { Star, Award } from "lucide-react";

interface UserProfileProps {
    user: User;
    issues: Issue[];
}

export function UserProfile({ user, issues }: UserProfileProps) {

  const karma = issues.reduce((acc, issue) => acc + issue.votes.up, 0);
  const civicScore = issues.length * 10 + karma - issues.reduce((acc, issue) => acc + issue.votes.down, 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-4xl">{user.name}</CardTitle>
            <div className="mt-2 flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">{karma}</span>
                    <span>Karma</span>
                </div>
                 <div className="flex items-center gap-1">
                    <Award className="h-5 w-5 text-blue-500" />
                    <span className="font-bold">{civicScore}</span>
                    <span>Civic Score</span>
                </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reported Issues</CardTitle>
          <CardDescription>
            A list of the civic issues reported by {user.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Upvotes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.title}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {issue.votes.up}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      This user has not reported any issues yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
