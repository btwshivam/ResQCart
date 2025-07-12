import axios from 'axios';
import type { NGO, Location, Route } from './types';

const API_BASE_URL = 'http://localhost:8000'; // Adjust based on your backend URL

export const rescueService = {
  async getNearbyNGOs(location: Location): Promise<NGO[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/nearby-ngos`, {
        lat: location.lat,
        lng: location.lng
      });

      return response.data.ngos || [];
    } catch (error) {
      console.error('Error fetching nearby NGOs:', error);
      throw new Error('Failed to fetch nearby NGOs');
    }
  },

  async getRoute(origin: Location, destination: Location): Promise<Route> {
    try {
      const response = await axios.post(`${API_BASE_URL}/route`, {
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw new Error('Failed to fetch route');
    }
  },

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(new Error('Failed to get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }
};
