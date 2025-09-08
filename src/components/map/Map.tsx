'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Issue } from '@/lib/types';
import L from 'leaflet';
import Link from 'next/link';

// Fix for default icon issues with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


interface MapProps {
  issues: Issue[];
}

export function Map({ issues }: MapProps) {
  // Default center if no issues are present
  const defaultCenter: [number, number] = [34.0522, -118.2437]; 
  const center = issues.length > 0 ? [issues[0].location.lat, issues[0].location.lng] : defaultCenter;

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map(issue => (
        <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]}>
          <Popup>
            <div className="p-1">
                <h3 className="font-bold">{issue.title}</h3>
                <p className="text-sm text-muted-foreground">{issue.category}</p>
                <Link href={`/issues/${issue.id}`} className="text-primary text-sm hover:underline mt-2 block">
                    View Details
                </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
