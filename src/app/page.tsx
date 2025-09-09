'use client';

import Image from 'next/image';
import Link from 'next/link';
import { issues as initialIssues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type VoteStatus = 'up' | 'down' | null;

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [userVotes, setUserVotes] = useState<Record<string, VoteStatus>>({});
  const { user } = useAuth();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Resolved':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleVote = (issueId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[issueId];
    let newVoteStatus: VoteStatus = voteType;
    
    setIssues(prevIssues => {
      const newIssues = [...prevIssues];
      const issueIndex = newIssues.findIndex((issue) => issue.id === issueId);
      if (issueIndex === -1) return prevIssues;
  
      const issue = { ...newIssues[issueIndex] };
      const voteCount = { ...issue.votes };
  
      // If current vote is same as new vote, undo it.
      if (currentVote === voteType) {
        newVoteStatus = null;
        if (voteType === 'up') {
          voteCount.up--;
        } else {
          voteCount.down--;
        }
      } else {
        // If there was a previous vote, undo its effect
        if (currentVote === 'up') {
          voteCount.up--;
        } else if (currentVote === 'down') {
          voteCount.down--;
        }
        
        // Apply the new vote
        if (voteType === 'up') {
          voteCount.up++;
        } else {
          voteCount.down++;
        }
      }
  
      issue.votes = voteCount;

      // Check if the issue should be rejected
      if (issue.votes.up - issue.votes.down <= -10) {
        issue.status = 'Rejected';
      }
      
      newIssues[issueIndex] = issue;
      
      setUserVotes({
        ...userVotes,
        [issueId]: newVoteStatus,
      });

      return newIssues;
    });
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground mt-2">
            View, vote, and discuss civic issues in your community.
          </p>
        </header>

        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="flex transition-shadow hover:shadow-md">
              <div className="flex flex-col items-center p-2 sm:p-4 bg-muted/50 border-r">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-1 text-muted-foreground hover:text-green-600"
                  onClick={() => handleVote(issue.id, 'up')}
                  disabled={!user || issue.status === 'Rejected'}
                >
                  <ArrowBigUp className={`h-5 w-5 ${userVotes[issue.id] === 'up' ? 'fill-green-600 text-green-600' : ''}`} />
                </Button>
                <span className="font-bold text-sm my-1">{issue.votes.up - issue.votes.down}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-1 text-muted-foreground hover:text-red-600"
                  onClick={() => handleVote(issue.id, 'down')}
                  disabled={!user || issue.status === 'Rejected'}
                >
                  <ArrowBigDown className={`h-5 w-5 ${userVotes[issue.id] === 'down' ? 'fill-red-600 text-red-600' : ''}`} />
                </Button>
              </div>
              <div className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Link href={`/profile/${issue.reporter.id}`}>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.reporter.avatarUrl} alt={issue.reporter.name} />
                        <AvatarFallback>{issue.reporter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <span>
                      Posted by{' '}
                      <Link href={`/profile/${issue.reporter.id}`} className="hover:underline">
                        {issue.reporter.name}
                      </Link>
                    </span>
                    <span>&bull;</span>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <Link href={`/issues/${issue.id}`} className="block">
                    <h3 className="text-lg font-semibold mb-2 hover:underline">{issue.title}</h3>

                    <div className="relative h-64 w-full rounded-md overflow-hidden bg-muted mb-4">
                      <Image
                        src={issue.imageUrl}
                        alt={issue.title}
                        fill
                        className="object-cover"
                        data-ai-hint={issue.imageHint}
                      />
                    </div>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/issues/${issue.id}`}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                <span className="text-xs">Comments</span>
                            </Link>
                        </Button>
                      <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
