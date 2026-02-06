'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Issue } from '@/lib/types';

// Create a completely bulletproof custom icon that doesn't depend on external files
const createCustomIcon = (color: string = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 25px;
        height: 35px;
        transform: translate(-50%, -100%);
      ">
        <!-- Marker Circle -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <!-- Pointer -->
        <div style="
          position: absolute;
          top: 21px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid ${color};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        "></div>
      </div>
    `,
    iconSize: [25, 35],
    iconAnchor: [12, 35],
    popupAnchor: [0, -35],
  });
};


interface MapProps {
  issues: Issue[];
}

export function Map({ issues = [] }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Already initialized

    try {
      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567], // Pune coordinates
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setIsInitialized(true);

    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }

    // No aggressive cleanup, just a simple return for the effect
    return () => {
      // The map instance is preserved, so we don't call map.remove()
    };
  }, []); // Run only once on mount

  // Update markers when issues change
  useEffect(() => {
    if (!isInitialized || !mapRef.current || !Array.isArray(issues)) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    issues.forEach((issue) => {
      if (issue?.location?.lat && issue?.location?.lng) {
        let color = '#3b82f6'; // default blue for 'Open'
        if (issue.priority === 'High') color = '#ef4444'; // red
        else if (issue.status === 'In Progress') color = '#f59e0b'; // orange
        else if (issue.status === 'Resolved') color = '#10b981'; // green
        else if (issue.status === 'Rejected') color = '#6b7280'; // gray

        const marker = L.marker([issue.location.lat, issue.location.lng], {
          icon: createCustomIcon(color),
          title: issue.title,
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui, sans-serif; padding: 8px;">
            <h3 style="font-weight: 600; margin: 0 0 8px 0; color: #1f2937; font-size: 16px; line-height: 1.4;">${issue.title}</h3>
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${issue.category || 'General'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px;">
              <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-weight: 500;">${issue.status || 'Open'}</span>
              <a href="/issues/${issue.id}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">View Details →</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      }
    });

    if (markersRef.current.length > 0) {
        if (markersRef.current.length === 1) {
            const marker = markersRef.current[0];
            map.setView(marker.getLatLng(), 15);
        } else {
            const group = new L.FeatureGroup(markersRef.current);
            map.fitBounds(group.getBounds(), { padding: [40, 40] });
        }
    }
  }, [issues, isInitialized]);

  return (
    <div className="h-full w-full relative">
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">Initializing map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ background: '#f8f9fa', visibility: isInitialized ? 'visible' : 'hidden' }}
      />
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
