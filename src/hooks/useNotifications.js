import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { sendNotificationToken } from '../api/client.js';
import { areNotificationsSupported } from '../utils/notifications.js';

// Lazy load notifications to avoid warnings in Expo Go
let Notifications = null;
const getNotifications = async () => {
  if (!Notifications && areNotificationsSupported()) {
    try {
      Notifications = await import('expo-notifications');
      // Only set notification handler if notifications are supported
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false
        })
      });
    } catch (error) {
      // Silently handle if notifications are not available
      console.warn('Notifications not available:', error.message);
      return null;
    }
  }
  return Notifications;
};

const useNotifications = ({ userId }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    const register = async () => {
      // Skip if notifications not supported (Expo Go)
      if (!areNotificationsSupported()) {
        return;
      }

      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return;
      }
      
      try {
        const Notifications = await getNotifications();
        if (!Notifications) return;
        
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        setPermissionStatus(finalStatus);
        if (finalStatus !== 'granted') {
          console.warn('Push notification permission not granted');
          return;
        }
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId ??
          undefined;
        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        setExpoPushToken(tokenData.data);
        try {
          await sendNotificationToken({ userId, token: tokenData.data });
        } catch (error) {
          console.error('Failed to register notification token', error);
        }
      } catch (error) {
        // Silently handle errors in Expo Go
        if (areNotificationsSupported()) {
          console.error('Notification registration error:', error);
        }
      }
    };

    register();
  }, [userId]);

  return {
    expoPushToken,
    permissionStatus
  };
};

export default useNotifications;

