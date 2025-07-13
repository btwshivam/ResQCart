import React, { useEffect, useRef, useState } from 'react';
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
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  // Initialize map
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
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
          // Add more options for better stability
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        });

        // Initialize directions renderer with error handling
        try {
          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 4,
            },
          });
          directionsRendererRef.current.setMap(mapInstanceRef.current);
        } catch (directionsError) {
          console.warn('Failed to initialize directions renderer:', directionsError);
          // Continue without directions renderer
        }
        
        setMapsLoaded(true);
      } catch (mapError) {
        console.error('Failed to initialize Google Map:', mapError);
        setMapsError(true);
      }
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.warn('Google Maps API key not found or invalid. Using fallback display.');
        setMapsError(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure Google Maps is fully loaded
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setMapsLoaded(true);
            initializeMap();
          } else {
            console.error('Google Maps failed to load properly');
            setMapsError(true);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setMapsError(true);
      };
      document.head.appendChild(script);
    } else {
      setMapsLoaded(true);
      initializeMap();
    }
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !mapsLoaded || mapsError) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.warn('Error clearing marker:', e);
        }
      });
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
    } catch (error) {
      console.error('Error updating user location on map:', error);
    }
  }, [userLocation, mapsLoaded, mapsError]);

  // Update NGO markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsLoaded || mapsError) return;

    try {
      // Clear existing NGO markers (keep user marker)
      const userMarker = markersRef.current[0];
      markersRef.current.forEach((marker, index) => {
        if (index > 0) {
          try {
            marker.setMap(null);
          } catch (e) {
            console.warn('Error clearing NGO marker:', e);
          }
        }
      });
      markersRef.current = userMarker ? [userMarker] : [];

      // Add NGO markers
      ngos.forEach((ngo) => {
        try {
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
            try {
              infoWindow.open(mapInstanceRef.current, marker);
            } catch (e) {
              console.warn('Error opening info window:', e);
            }
          });

          markersRef.current.push(marker);
        } catch (markerError) {
          console.warn('Error creating NGO marker:', markerError);
        }
      });

      // Adjust map bounds to fit all markers
      if (markersRef.current.length > 1) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          markersRef.current.forEach(marker => {
            try {
              bounds.extend(marker.getPosition());
            } catch (e) {
              console.warn('Error extending bounds:', e);
            }
          });
          mapInstanceRef.current.fitBounds(bounds);
        } catch (boundsError) {
          console.warn('Error fitting bounds:', boundsError);
        }
      }
    } catch (error) {
      console.error('Error updating NGO markers:', error);
    }
  }, [ngos, selectedNGO, mapsLoaded, mapsError]);

  // Update route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeInfo || !userLocation || !selectedNGO || !mapsLoaded || mapsError) {
      // Clear existing route
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setDirections({ routes: [] });
        } catch (e) {
          console.warn('Error clearing directions:', e);
        }
      }
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }, [routeInfo, userLocation, selectedNGO, mapsLoaded, mapsError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        markersRef.current.forEach(marker => {
          try {
            marker.setMap(null);
          } catch (e) {
            console.warn('Error during cleanup:', e);
          }
        });
        markersRef.current = [];
      } catch (error) {
        console.error('Error during component cleanup:', error);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-b-lg"
        style={{ minHeight: '300px' }}
      />

      {(!mapsLoaded || mapsError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-b-lg">
          <div className="text-center p-4 max-w-md">
            {!mapsError ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading Google Maps...</p>
                <p className="text-xs text-gray-500 mt-1">
                  Please wait while we load the map
                </p>
              </>
            ) : (
              <>
                <div className="text-blue-500 mb-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Interactive Map Unavailable</p>
                <p className="text-xs text-gray-500 mt-1">
                  Using simplified view - all functionality still works
                </p>
              </>
            )}
            
            {/* Fallback NGO list when Google Maps is not available */}
            {ngos.length > 0 && (
              <div className="mt-4 text-left max-h-48 overflow-y-auto bg-white rounded-lg p-3 border">
                <p className="text-xs font-medium text-gray-700 mb-2">📍 Nearby NGOs & Food Banks:</p>
                {ngos.map((ngo, index) => (
                  <div key={ngo.place_id || index} className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded border-l-2 border-indigo-200">
                    <div className="font-medium text-gray-800">{ngo.name}</div>
                    <div className="text-gray-600">{ngo.address}</div>
                    {ngo.rating && (
                      <div className="text-gray-500 mt-1">
                        ⭐ Rating: {ngo.rating}/5
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2 italic">
                  Click on any NGO in the list to get directions
                </p>
              </div>
            )}
            
            {ngos.length === 0 && !mapsError && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  No NGOs found nearby. Try expanding your search radius.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!userLocation && mapsLoaded && !mapsError && (
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