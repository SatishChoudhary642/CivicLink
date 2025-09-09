'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Issue } from '@/lib/types';
import { cn } from '@/lib/utils';

type VoteStatus = 'up' | 'down' | null;

interface IssueCardProps {
  issue: Issue;
}

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

export function IssueCard({ issue: initialIssue }: IssueCardProps) {
  const [issue, setIssue] = useState(initialIssue);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>(null);
  const { user } = useAuth();

  const handleVote = (voteType: 'up' | 'down') => {
    let newVoteStatus: VoteStatus = voteType;
    let newUpVotes = issue.votes.up;
    let newDownVotes = issue.votes.down;

    if (voteStatus === voteType) {
      newVoteStatus = null;
      if (voteType === 'up') newUpVotes--; else newDownVotes--;
    } else {
      if (voteStatus === 'up') newUpVotes--;
      if (voteStatus === 'down') newDownVotes--;
      if (voteType === 'up') newUpVotes++; else newDownVotes++;
    }

    setVoteStatus(newVoteStatus);
    
    let newStatus = issue.status;
    if (newUpVotes - newDownVotes <= -10) {
      newStatus = 'Rejected';
    } else if (issue.status === 'Rejected' && newUpVotes - newDownVotes > -10) {
      newStatus = 'Open';
    }
    
    setIssue({
      ...issue,
      votes: { up: newUpVotes, down: newDownVotes },
      status: newStatus,
    });
  };

  return (
    <Card className="flex transition-shadow hover:shadow-md">
      <div className="flex flex-col items-center p-2 sm:p-4 bg-muted/50 border-r">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-1 text-muted-foreground hover:text-green-600"
          onClick={() => handleVote('up')}
          disabled={!user}
        >
          <ArrowBigUp className={cn('h-5 w-5', voteStatus === 'up' && 'fill-green-600 text-green-600')} />
        </Button>
        <span className="font-bold text-sm my-1">{issue.votes.up - issue.votes.down}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-1 text-muted-foreground hover:text-red-600"
          onClick={() => handleVote('down')}
          disabled={!user}
        >
          <ArrowBigDown className={cn('h-5 w-5', voteStatus === 'down' && 'fill-red-600 text-red-600')} />
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
                  <span className="text-xs">Comments ({issue.comments.length})</span>
                </Link>
              </Button>
              <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{issue.location.address}</p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
