'use client';

import { issues } from '@/lib/data';
import MapLoader from '@/components/map/MapLoader';

export default function MapPage() {
  // In a real app, you might fetch this data, but for now we import it.
  const allIssues = issues;

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <MapLoader issues={allIssues} />
    </div>
  );
}
