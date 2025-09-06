import { issues, users } from "@/lib/data";
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

// In a real app, you would get the current user from your authentication system.
const currentUserId = "user-1";

export default function ProfilePage() {
  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) {
    return <div className="container mx-auto p-8">User not found.</div>
  }

  const myIssues: Issue[] = issues.filter(issue => issue.reporter.id === currentUser.id);

  const karma = myIssues.reduce((acc, issue) => acc + issue.votes.up, 0);
  const civicScore = myIssues.length * 10 + karma - myIssues.reduce((acc, issue) => acc + issue.votes.down, 0);

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
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-4xl">{currentUser.name}</CardTitle>
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
          <CardTitle>My Reported Issues</CardTitle>
          <CardDescription>
            A list of the civic issues you have submitted.
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
                {myIssues.length > 0 ? (
                  myIssues.map((issue) => (
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
                      You have not reported any issues yet.
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
