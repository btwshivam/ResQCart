import React, { useState, useEffect } from 'react';
import { MapPinIcon, TruckIcon, ClockIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { rescueApi } from '../../services/api';
import type { NGO, RouteInfo, UserLocation } from '../../types/rescue';
import GoogleMapComponent from './GoogleMapComponent';
import NGOList from './NGOList';

const RescueNetwork: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyNGOs, setNearbyNGOs] = useState<NGO[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationPermission('granted');
        setLoading(false);

        // Automatically find nearby NGOs
        findNearbyNGOs(location.lat, location.lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setError('Unable to get your location. Please enable location services and try again.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Find nearby NGOs
  const findNearbyNGOs = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await rescueApi.getNearbyNGOs(lat, lng);
      setNearbyNGOs(response.data.ngos);

      if (response.data.ngos.length === 0) {
        setError('No NGOs found nearby. Try expanding your search radius.');
      }
    } catch (error) {
      console.error('Error finding NGOs:', error);
      setError('Failed to find nearby NGOs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get route to selected NGO
  const getRouteToNGO = async (ngo: NGO) => {
    if (!userLocation) {
      setError('User location not available. Please enable location services.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await rescueApi.getRoute(
        userLocation.lat,
        userLocation.lng,
        ngo.lat,
        ngo.lng
      );

      setRouteInfo(response.data);
      setSelectedNGO(ngo);
    } catch (error) {
      console.error('Error getting route:', error);
      setError('Failed to get route directions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual location input (fallback)
  const handleManualLocationSearch = async (address: string) => {
    // You can implement geocoding here if needed
    setError('Manual location search will be implemented with geocoding API.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rescue Network</h1>
        <p className="text-gray-600">
          Connect with nearby food banks and NGOs to donate surplus food and reduce waste.
        </p>
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPinIcon className="h-6 w-6 mr-2 text-indigo-600" />
            Your Location
          </h2>
          {!userLocation && (
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Get My Location
                </>
              )}
            </button>
          )}
        </div>

        {userLocation ? (
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1 text-green-600" />
            <span>
              Location detected: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              {userLocation.address && ` (${userLocation.address})`}
            </span>
          </div>
        ) : locationPermission === 'denied' ? (
          <div className="text-sm text-amber-600">
            <p>Location access denied. You can still search for NGOs by entering an address manually.</p>
            <input
              type="text"
              placeholder="Enter your address or location"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualLocationSearch((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Click "Get My Location" to find nearby NGOs and food banks.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NGO List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Nearby NGOs & Food Banks
              {nearbyNGOs.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {nearbyNGOs.length} found
                </span>
              )}
            </h2>
          </div>
          <NGOList 
            ngos={nearbyNGOs}
            selectedNGO={selectedNGO}
            onSelectNGO={getRouteToNGO}
            loading={loading}
          />
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TruckIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Route & Directions
            </h2>
          </div>
          <div className="h-96">
            <GoogleMapComponent
              userLocation={userLocation}
              ngos={nearbyNGOs}
              selectedNGO={selectedNGO}
              routeInfo={routeInfo}
            />
          </div>
        </div>
      </div>

      {/* Route Details */}
      {routeInfo && selectedNGO && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Directions to {selectedNGO.name}
          </h3>
          <div className="space-y-3">
            {routeInfo.steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div 
                    className="text-sm text-gray-900"
                    dangerouslySetInnerHTML={{ __html: step.instruction }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {step.distance} • {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueNetwork;
