import React from 'react';
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import type { NGO } from '../../types/rescue';

interface NGOListProps {
  ngos: NGO[];
  selectedNGO: NGO | null;
  onSelectNGO: (ngo: NGO) => void;
  loading: boolean;
}

const NGOList: React.FC<NGOListProps> = ({ ngos, selectedNGO, onSelectNGO, loading }) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (ngos.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <MapPinIcon className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No NGOs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No food banks or NGOs found in your area. Try expanding your search radius.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {ngos.map((ngo, index) => (
          <div
            key={ngo.place_id || index}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedNGO?.place_id === ngo.place_id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
            }`}
            onClick={() => onSelectNGO(ngo)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {ngo.name}
                </h3>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{ngo.address}</span>
                </div>

                <div className="flex items-center text-xs text-gray-400">
                  <span>Lat: {ngo.lat.toFixed(4)}, Lng: {ngo.lng.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNGO(ngo);
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedNGO?.place_id === ngo.place_id
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedNGO?.place_id === ngo.place_id ? 'Selected' : 'Get Route'}
                </button>
              </div>
            </div>

            {/* Contact Information (if available) */}
            <div className="mt-3 flex space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open in Google Maps
                  window.open(`https://www.google.com/maps/place/?q=place_id:${ngo.place_id}`, '_blank');
                }}
                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
              >
                <GlobeAltIcon className="h-3 w-3 mr-1" />
                View on Maps
              </button>
            </div>

            {/* Distance indicator (you can calculate this based on user location) */}
            {selectedNGO?.place_id === ngo.place_id && (
              <div className="mt-2 text-xs text-indigo-600 font-medium">
                ✓ Route calculated - see directions below
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NGOList;
