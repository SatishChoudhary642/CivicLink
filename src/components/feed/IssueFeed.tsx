'use client';

import { IssueCard } from '@/components/feed/IssueCard';
import { useIssues } from '@/context/IssueContext';
import { useEffect } from 'react';
import type { Issue } from '@/lib/types';

interface IssueFeedProps {
    initialIssues: Issue[];
}

export function IssueFeed({ initialIssues }: IssueFeedProps) {
  const { issues, setIssues } = useIssues();

  useEffect(() => {
    // Set the initial issues from the server, but only if the context hasn't been populated yet.
    // This allows client-side updates (like adding an issue) to persist without being overwritten.
    if (issues.length === 0) {
        setIssues(initialIssues);
    }
  }, [initialIssues, setIssues, issues.length]);

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
