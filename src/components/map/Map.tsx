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

  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      // Clear markers first
      if (markersRef.current) {
        markersRef.current.forEach(marker => {
          try {
            if (mapRef.current?.hasLayer(marker)) {
              mapRef.current.removeLayer(marker);
            }
          } catch (err) {
            console.warn('Error removing marker:', err);
          }
        });
        markersRef.current = [];
      }

      // Remove map instance
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.warn('Error removing map:', err);
        }
        mapRef.current = null;
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    // Prevent re-initialization
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const mapContainer = mapContainerRef.current;
      
      const map = L.map(mapContainer, {
        center: [18.5204, 73.8567], // Pune coordinates
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      mapRef.current = map;
      setIsInitialized(true);
      setError(null);

      // Add resize handler
      const resizeHandler = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };
      
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
        cleanup();
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, [cleanup]); // Only run once

  // Update markers when issues change
  useEffect(() => {
    if (!isInitialized || !mapRef.current || !Array.isArray(issues)) return;

    try {
      const map = mapRef.current;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (err) {
          console.warn('Error removing marker:', err);
        }
      });
      markersRef.current = [];

      // Add new markers
      issues.forEach((issue) => {
        if (issue?.location?.lat && issue?.location?.lng) {
          try {
            // Use different colors for different statuses
            let color = '#3b82f6'; // default blue for 'Open'
            if (issue.priority === 'High') color = '#ef4444'; // red
            else if (issue.status === 'In Progress') color = '#f59e0b'; // orange
            else if (issue.status === 'Resolved') color = '#10b981'; // green
            else if (issue.status === 'Rejected') color = '#6b7280'; // gray

            const marker = L.marker([issue.location.lat, issue.location.lng], {
              icon: createCustomIcon(color),
              title: issue.title, // Tooltip on hover
            });

            // Create popup content
            const popupContent = `
              <div style="
                min-width: 200px; 
                font-family: system-ui, sans-serif;
                padding: 8px;
              ">
                <h3 style="
                  font-weight: 600; 
                  margin: 0 0 8px 0; 
                  color: #1f2937;
                  font-size: 16px;
                  line-height: 1.4;
                ">${issue.title}</h3>
                
                <p style="
                  margin: 0 0 12px 0; 
                  color: #6b7280;
                  font-size: 13px;
                  line-height: 1.4;
                ">${issue.category || 'General'}</p>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding-top: 8px;
                  border-top: 1px solid #e5e7eb;
                  font-size: 12px;
                ">
                  <span style="
                    background: ${color};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                  ">${issue.status || 'Open'}</span>
                  
                  <a href="/issues/${issue.id}" style="
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 500;
                  " onclick="event.stopPropagation();">View Details →</a>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });

            marker.addTo(map);
            markersRef.current.push(marker);
          } catch (err) {
            console.warn('Error adding marker for issue', issue.id, ':', err);
          }
        }
      });

      // Fit map bounds to show all markers
      if (markersRef.current.length > 0) {
        try {
          if (markersRef.current.length === 1) {
            // Single marker - center on it
            const marker = markersRef.current[0];
            map.setView(marker.getLatLng(), 15);
          } else {
            // Multiple markers - fit bounds
            const group = new L.FeatureGroup(markersRef.current);
            map.fitBounds(group.getBounds(), { padding: [40, 40] });
          }
        } catch (err) {
          console.warn('Error fitting bounds:', err);
        }
      }
    } catch (err) {
      console.error('Error updating markers:', err);
      setError(err instanceof Error ? err.message : 'Failed to update markers');
    }
  }, [issues, isInitialized]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <div className="text-red-600 text-xl mb-2">⚠️ Map Error</div>
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsInitialized(false);
              cleanup();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
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
      
      {/* Map overlays */}
      {isInitialized && issues.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] border">
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">📍</span>
            No issues to display on map
          </p>
        </div>
      )}

      {/* Custom CSS for popups */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
