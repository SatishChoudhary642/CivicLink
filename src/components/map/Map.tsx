'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Issue } from '@/lib/types';
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

export function Map({ issues = [] }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [34.0522, -118.2437], // Default to Los Angeles
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run only once on mount

  // Update markers when issues change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !Array.isArray(issues)) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    issues.forEach((issue) => {
      if (issue?.location?.lat && issue?.location?.lng) {
        const popupContent = `
          <div style="padding: 4px;">
            <h3 style="font-weight: bold; font-size: 1rem; margin-bottom: 4px;">${issue.title}</h3>
            <p style="font-size: 0.875rem; color: #666; margin-bottom: 8px;">${issue.category}</p>
            <a href="/issues/${issue.id}" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 500;">View Details</a>
          </div>
        `;
        
        const marker = L.marker([issue.location.lat, issue.location.lng])
          .bindPopup(popupContent)
          .addTo(map);
        
        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [issues]);

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" />
      {issues.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-gray-600">No issues to display on map</p>
        </div>
      )}
    </div>
  );
}
