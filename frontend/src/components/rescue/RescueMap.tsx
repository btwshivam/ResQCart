import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NGO, Location, Route } from './types';

// Fix for default markers in react-leaflet
import L from 'leaflet'; 

let DefaultIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <div class="w-3 h-3 bg-white rounded-full"></div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24]
});

let NGOIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <span class="text-white text-xs font-bold">❤️</span>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RescueMapProps {
  userLocation: Location | null;
  ngos: NGO[];
  selectedNGO: NGO | null;
  route: Route | null;
  onNGOClick: (ngo: NGO) => void;
}

// Component to handle map bounds and route display
const MapController: React.FC<{
  userLocation: Location | null;
  ngos: NGO[];
  selectedNGO: NGO | null;
  route: Route | null;
}> = ({ userLocation, ngos, selectedNGO, route }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && ngos.length === 0) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    } else if (userLocation && ngos.length > 0) {
      const bounds = new LatLngBounds([]);
      bounds.extend([userLocation.lat, userLocation.lng]);
      ngos.forEach(ngo => bounds.extend([ngo.lat, ngo.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, userLocation, ngos]);

  useEffect(() => {
    if (route && selectedNGO && userLocation) {
      // Decode polyline and add route to map
      // For now, we'll just focus on the selected NGO
      const bounds = new LatLngBounds([]);
      bounds.extend([userLocation.lat, userLocation.lng]);
      bounds.extend([selectedNGO.lat, selectedNGO.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route, selectedNGO, userLocation]);

  return null;
};

const RescueMap: React.FC<RescueMapProps> = ({
  userLocation,
  ngos,
  selectedNGO,
  route,
  onNGOClick
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to SF

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          userLocation={userLocation}
          ngos={ngos}
          selectedNGO={selectedNGO}
          route={route}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600">Your Location</div>
                <div className="text-sm text-gray-600">You are here</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* NGO markers */}
        {ngos.map((ngo, index) => (
          <Marker
            key={`${ngo.place_id}-${index}`}
            position={[ngo.lat, ngo.lng]}
            icon={NGOIcon}
            eventHandlers={{
              click: () => onNGOClick(ngo)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-gray-900 mb-2">{ngo.name}</div>
                <div className="text-sm text-gray-600 mb-2">{ngo.address}</div>
                <button
                  onClick={() => onNGOClick(ngo)}
                  className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Select This NGO
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-sm font-semibold text-gray-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full border border-white mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-white mr-2 flex items-center justify-center">
              <span style={{ fontSize: '8px' }}>❤️</span>
            </div>
            <span>Food Banks & NGOs</span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 z-[1000]">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${userLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium">
            {userLocation ? 'Location Found' : 'Finding Location...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RescueMap;
