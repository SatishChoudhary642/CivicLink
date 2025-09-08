import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import { Map } from '@/components/map/Map';
import { Card } from '@/components/ui/card';

export default function MapPage() {
  const issuesWithLocations = issues.filter(issue => issue.location && issue.location.lat && issue.location.lng);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Map issues={issuesWithLocations} />
    </div>
  );
}
