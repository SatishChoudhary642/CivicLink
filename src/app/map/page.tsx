import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function MapPage() {
  const issuesWithLocations = issues.filter(issue => issue.location && issue.location.lat && issue.location.lng);

  const Map = useMemo(() => dynamic(() => import('@/components/map/Map').then(mod => mod.Map), { 
    loading: () => <Skeleton className="h-full w-full" />,
    ssr: false 
  }), []);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Map issues={issuesWithLocations} />
    </div>
  );
}
