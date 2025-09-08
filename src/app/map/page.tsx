'use client';

import MapLoader from '@/components/map/MapLoader';
import { issues } from '@/lib/data';

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <MapLoader issues={issues} />
    </div>
  );
}
