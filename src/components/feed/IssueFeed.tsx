'use client';

import { IssueCard } from '@/components/feed/IssueCard';
import { useIssues } from '@/context/IssueContext';
import type { Issue } from '@/lib/types';

export function IssueFeed() {
  const { issues } = useIssues();

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
