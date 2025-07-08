import { SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  options: {
    expiresIn: '24h',
    algorithm: 'HS256'
  } as SignOptions
}; 