import Constants from 'expo-constants';

// Check if running in Expo Go (where notifications are limited)
export const isExpoGo = () => {
  return Constants.executionEnvironment === 'storeClient' || 
         Constants.appOwnership === 'expo';
};

// Check if notifications are supported
export const areNotificationsSupported = () => {
  // Notifications work in development builds and standalone apps
  // They don't work in Expo Go (SDK 53+)
  return !isExpoGo();
};

