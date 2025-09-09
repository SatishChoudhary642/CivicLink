'use client';

import { IssueCard } from '@/components/feed/IssueCard';
import { useIssues } from '@/context/IssueContext';

export default function Home() {
  const { issues } = useIssues();

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
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </div>
  );
}
