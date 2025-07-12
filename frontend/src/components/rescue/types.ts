export interface NGO {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  distance?: string;
  duration?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface RouteStep {
  distance: string;
  duration: string;
  instruction: string;
}

export interface Route {
  polyline: string;
  steps: RouteStep[];
}