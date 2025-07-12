import React from 'react';
import { MapPinIcon, PhoneIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { NGO } from './types';

interface NGOCardProps {
  ngo: NGO;
  isSelected: boolean;
  onSelect: (ngo: NGO) => void;
  onGetDirections: (ngo: NGO) => void;
}

const NGOCard: React.FC<NGOCardProps> = ({ ngo, isSelected, onSelect, onGetDirections }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 mb-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(ngo)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {ngo.name}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{ngo.address}</span>
          </div>

          {(ngo.distance || ngo.duration) && (
            <div className="text-sm text-gray-500 mb-3">
              {ngo.distance && <span className="mr-4">📍 {ngo.distance}</span>}
              {ngo.duration && <span>⏱️ {ngo.duration}</span>}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <HeartIcon className="h-6 w-6 text-red-500" />
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGetDirections(ngo);
          }}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Get Directions
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            // Contact functionality can be added here
          }}
          className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <PhoneIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Food Bank • Non-Profit</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default NGOCard;