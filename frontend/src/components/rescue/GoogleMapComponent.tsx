import React, { useEffect, useRef } from 'react';
import type { NGO, RouteInfo, UserLocation } from '../../types/rescue';

interface GoogleMapComponentProps {
  userLocation: UserLocation | null;
  ngos: NGO[];
  selectedNGO: NGO | null;
  routeInfo: RouteInfo | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  userLocation,
  ngos,
  selectedNGO,
  routeInfo,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const defaultCenter = userLocation || { lat: 40.7128, lng: -74.0060 }; // Default to NYC

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: userLocation ? 13 : 10,
        center: defaultCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      // Initialize directions renderer
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 4,
        },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="24" height="24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    });
    markersRef.current.push(userMarker);

    // Center map on user location
    mapInstanceRef.current.setCenter(userLocation);
    mapInstanceRef.current.setZoom(13);
  }, [userLocation]);

  // Update NGO markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing NGO markers (keep user marker)
    const userMarker = markersRef.current[0];
    markersRef.current.forEach((marker, index) => {
      if (index > 0) marker.setMap(null);
    });
    markersRef.current = userMarker ? [userMarker] : [];

    // Add NGO markers
    ngos.forEach((ngo) => {
      const marker = new window.google.maps.Marker({
        position: { lat: ngo.lat, lng: ngo.lng },
        map: mapInstanceRef.current,
        title: ngo.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${selectedNGO?.place_id === ngo.place_id ? '#4F46E5' : '#059669'}" width="24" height="24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${ngo.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${ngo.address}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Adjust map bounds to fit all markers
    if (markersRef.current.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [ngos, selectedNGO]);

  // Update route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeInfo || !userLocation || !selectedNGO) {
      // Clear existing route
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
      }
      return;
    }

    // Use the polyline from your backend to display the route
    if (window.google && routeInfo.polyline) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(routeInfo.polyline);

      const routePolyline = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#4F46E5',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      routePolyline.setMap(mapInstanceRef.current);

      // Fit bounds to show the entire route
      const bounds = new window.google.maps.LatLngBounds();
      decodedPath.forEach((point: any) => bounds.extend(point));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [routeInfo, userLocation, selectedNGO]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-b-lg"
        style={{ minHeight: '300px' }}
      />

      {!window.google && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-b-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Google Maps...</p>
            <p className="text-xs text-gray-500 mt-1">
              Make sure VITE_GOOGLE_MAPS_API_KEY is set in your environment
            </p>
          </div>
        </div>
      )}

      {!userLocation && window.google && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border">
          <p className="text-sm text-gray-600">
            📍 Enable location to see nearby NGOs and get directions
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;