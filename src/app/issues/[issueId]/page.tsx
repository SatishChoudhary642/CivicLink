'use client';

import { dataStore } from "@/lib/data";
import { getInitialUsers } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import type { Comment, Issue } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function IssuePage() {
  const params = useParams();
  const issueId = params.issueId as string;
  const { user } = useAuth();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState("");
  const users = getInitialUsers(); 

  useEffect(() => {
    const allIssues = dataStore.getIssues();
    const currentIssue = allIssues.find(i => i.id === issueId);
    if(currentIssue) {
        setIssue(currentIssue);
    }
  }, [issueId]);


  if (!issue) {
    // You can render a loading state here until the issue is found
    const issueFromStore = dataStore.getIssues().find(i => i.id === issueId);
    if (!issueFromStore) {
       return notFound();
    }
    setIssue(issueFromStore);
    return null;
  }
  
  const currentUser = user ? users.find(u => u.id === user.id) : null;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handlePostComment = () => {
    if (!newComment.trim() || !currentUser || !issue) return;

    const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment,
        user: currentUser,
        createdAt: new Date().toISOString(),
    };
    
    const allIssues = dataStore.getIssues();
    const updatedIssues = allIssues.map(i => {
        if (i.id === issue.id) {
            const updatedIssue = {
                ...i,
                comments: [...i.comments, comment]
            };
            setIssue(updatedIssue); // Update local state for immediate feedback
            return updatedIssue;
        }
        return i;
    });

    dataStore.saveIssues(updatedIssues);
    setNewComment("");
  }

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
                        Comments ({issue.comments.length})
                    </h3>
                    
                    {user ? (
                        <div className="flex flex-col gap-2">
                            <Textarea 
                                placeholder="Add your comment..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button className="self-end" onClick={handlePostComment} disabled={!newComment.trim()}>Post Comment</Button>
                        </div>
                    ) : (
                        <div className="border rounded-md p-4 text-center text-muted-foreground">
                            <p>
                                <Link href="/login" className="text-primary hover:underline">Log in</Link> to join the discussion.
                            </p>
                        </div>
                    )}


                    <div className="space-y-4">
                        {issue.comments.length > 0 ? (
                            issue.comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <Link href={`/profile/${comment.user.id}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1">
                                        <div className="text-sm">
                                            <Link href={`/profile/${comment.user.id}`} className="font-semibold hover:underline">{comment.user.name}</Link>
                                            <span className="text-muted-foreground ml-2 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-foreground/90 mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="border rounded-md p-4 text-center text-muted-foreground">
                                <p>No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
