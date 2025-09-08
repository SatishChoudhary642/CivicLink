'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';

export default function MapPage() {
  const issuesWithLocations: Issue[] = issues.filter(
    (issue) => issue.location && typeof issue.location.lat === 'number' && typeof issue.location.lng === 'number'
  );

  // Dynamically import the Map component with SSR disabled
  const Map = useMemo(
    () =>
      dynamic(() => import('@/components/map/Map').then((mod) => mod.Map), {
        loading: () => <Skeleton className="h-full w-full" />,
        ssr: false,
      }),
    []
  );

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Map issues={issuesWithLocations} />
    </div>
  );
}
