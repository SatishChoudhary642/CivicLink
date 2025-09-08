'use client';

import { issues } from '@/lib/data';
import MapLoader from '@/components/map/MapLoader';

export default function MapPage() {
  const issuesWithLocations = issues.filter(issue => issue.location && issue.location.lat && issue.location.lng);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <MapLoader issues={issuesWithLocations} />
    </div>
  );
}
