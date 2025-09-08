'use client';

import { issues } from '@/lib/data';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Map = dynamic(() => import('@/components/map/Map').then(mod => mod.Map), { 
  loading: () => <Skeleton className="h-full w-full" />,
  ssr: false 
});

export default function MapPage() {
  const issuesWithLocations = issues.filter(issue => issue.location && issue.location.lat && issue.location.lng);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Map issues={issuesWithLocations} />
    </div>
  );
}
