import axios from 'axios';
import { Platform } from 'react-native';

const LAN_IP = '192.168.1.4';
const PORT = 3000;
const USE_REAL_DEVICE = true;

const host = USE_REAL_DEVICE ? LAN_IP : Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = `http://${host}:${PORT}`;
export const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

export const getServerMessage = (err: any): string | undefined => {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  return undefined;
};
