import { getIssues } from '@/lib/data';
import { IssueFeed } from '@/components/feed/IssueFeed';

// This is now a Server Component
export default async function Home() {
  // Fetch initial issues on the server
  const initialIssues = await getIssues();

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground mt-2">
            View, vote, and discuss civic issues in your community.
          </p>
        </header>
        {/* Pass server-fetched data to the new Client Component */}
        <IssueFeed initialIssues={initialIssues} />
      </div>
    </div>
  );
}
