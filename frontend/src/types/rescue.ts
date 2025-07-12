export interface NGO {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

export interface RouteStep {
  distance: string;
  duration: string;
  instruction: string;
}

export interface RouteInfo {
  polyline: string;
  steps: RouteStep[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface UserLocation extends Location {
  address?: string;
}