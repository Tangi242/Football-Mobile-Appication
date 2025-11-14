import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { sendNotificationToken } from '../api/client.js';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const useNotifications = ({ userId }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    const register = async () => {
      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return;
      }
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
    };

    register();
  }, [userId]);

  return {
    expoPushToken,
    permissionStatus
  };
};

export default useNotifications;

