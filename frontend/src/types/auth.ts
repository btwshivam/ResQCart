export type UserRole = 'admin' | 'user' | 'rescue';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: UserRole;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  organizationName?: string;
  organizationType?: 'NGO' | 'Government' | 'Private' | 'Other';
  serviceArea?: string[];
  vehicleType?: string;
  vehicleNumber?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
} 