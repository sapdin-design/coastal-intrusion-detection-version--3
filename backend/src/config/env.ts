import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cidrtm',
  JWT_SECRET: process.env.JWT_SECRET || 'cidrtm_super_secure_coastal_jwt_secret_key_2026_kanyakumari',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SIMULATION_TICK_RATE_MS: parseInt(process.env.SIMULATION_TICK_RATE_MS || '1000', 10),
  DEFAULT_SECTOR: {
    name: 'Kanyakumari Coastal Sector',
    centerLat: 8.078,
    centerLon: 77.555,
    zoom: 11
  }
};
