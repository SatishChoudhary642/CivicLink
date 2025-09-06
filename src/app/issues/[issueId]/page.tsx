import { issues } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface IssuePageParams {
    params: {
        issueId: string;
    }
}

export default function IssuePage({ params }: IssuePageParams) {
  const issue = issues.find(i => i.id === params.issueId);

  if (!issue) {
    notFound();
  }
  
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
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href={`/profile/${issue.reporter.id}`}>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={issue.reporter.avatarUrl} alt={issue.reporter.name} />
                        <AvatarFallback>{issue.reporter.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    </Link>
                    <span>Posted by <Link href={`/profile/${issue.reporter.id}`} className="hover:underline">{issue.reporter.name}</Link></span>
                    <span>&bull;</span>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                <CardTitle className="font-headline text-4xl">{issue.title}</CardTitle>
                <div className="flex items-center gap-4 pt-2">
                    <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                    <span className="text-sm text-muted-foreground">{issue.location.address}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative h-96 w-full rounded-md overflow-hidden bg-muted mb-6">
                    <Image
                        src={issue.imageUrl}
                        alt={issue.title}
                        fill
                        className="object-cover"
                        data-ai-hint={issue.imageHint}
                    />
                </div>
                <p className="text-foreground/90 mb-8">{issue.description}</p>

                <Separator className="my-6" />

                <div className="space-y-6">
                    <h3 className="text-2xl font-semibold flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        Comments
                    </h3>
                    
                    {/* Add Comment Form */}
                    <div className="flex flex-col gap-2">
                        <Textarea placeholder="Add your comment..." />
                        <Button className="self-end">Post Comment</Button>
                    </div>

                    {/* Placeholder for comments */}
                    <div className="border rounded-md p-4 text-center text-muted-foreground">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>

                </div>
            </CardContent>
        </Card>
    </div>
  );
}
