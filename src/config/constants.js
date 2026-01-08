import Constants from 'expo-constants';
import { placeholderImages } from '../assets/placeholders.js';
import { onlineImages } from '../assets/onlineImages.js';

const deriveHostFromExpo = () => {
  const hostUri = Constants.expoGoConfig?.hostUri || Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const [host] = hostUri.split(':');
  return host;
};

const derivedHost = deriveHostFromExpo();
const derivedApi = derivedHost ? `http://${derivedHost}:4000/api` : null;
const derivedWs = derivedHost ? `http://${derivedHost}:4000` : null;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || derivedApi || 'http://localhost:4000/api';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || derivedWs || 'http://localhost:4000';

export const DEFAULT_REFEREE_AVATAR = { uri: onlineImages.players[0] };

