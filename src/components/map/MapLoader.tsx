'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Issue } from '@/lib/types';

const Map = dynamic(() => import('@/components/map/Map').then(mod => mod.Map), {
  loading: () => <Skeleton className="h-full w-full" />,
  ssr: false,
});

interface MapLoaderProps {
    issues: Issue[];
}

export default function MapLoader({ issues }: MapLoaderProps) {
  return <Map issues={issues} />;
}
