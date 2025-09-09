'use client';

import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import MapLoader from '@/components/map/MapLoader';

export default function MapPage() {
  const issuesWithLocations: Issue[] = issues.filter(
    (issue) => 
      issue.location && 
      typeof issue.location.lat === 'number' && 
      typeof issue.location.lng === 'number'
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header with issue count */}
      <div className="flex-shrink-0 p-3 bg-white border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Issues Map</h1>
          <div className="text-sm text-gray-500">
            {issuesWithLocations.length} issue{issuesWithLocations.length !== 1 ? 's' : ''} with locations
          </div>
        </div>
      </div>
      
      {/* Map container */}
      <div className="flex-1">
        {issuesWithLocations.length > 0 ? (
          <MapLoader issues={issuesWithLocations} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Issues with Locations</h2>
              <p className="text-gray-500">Add location data to issues to see them on the map.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
