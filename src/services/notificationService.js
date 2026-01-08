import { sendNotificationToken } from '../api/client.js';
import { areNotificationsSupported } from '../utils/notifications.js';

// Lazy load notifications to avoid warnings in Expo Go
let Notifications = null;
const getNotifications = async () => {
  if (!Notifications && areNotificationsSupported()) {
    try {
      Notifications = await import('expo-notifications');
      // Configure notification handler only if supported
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true
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

export const scheduleMatchNotifications = async (match, userId) => {
  if (!areNotificationsSupported()) {
    return; // Skip in Expo Go
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    
    // Cancel existing notifications for this match
    await Notifications.cancelAllScheduledNotificationsAsync();

    const matchDate = new Date(match.match_date);
    const now = new Date();

    // Only schedule if match is in the future
    if (matchDate <= now) return;

    // Notification 1: 1 hour before match
    const oneHourBefore = new Date(matchDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Match Starting Soon!',
          body: `${match.home_team} vs ${match.away_team} starts in 1 hour`,
          data: { matchId: match.id, type: 'match_reminder' },
          sound: true
        },
        trigger: oneHourBefore
      });
    }

    // Notification 2: 15 minutes before match
    const fifteenMinBefore = new Date(matchDate.getTime() - 15 * 60 * 1000);
    if (fifteenMinBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Match Starting!',
          body: `${match.home_team} vs ${match.away_team} starts in 15 minutes`,
          data: { matchId: match.id, type: 'match_starting' },
          sound: true
        },
        trigger: fifteenMinBefore
      });
    }

    // Notification 3: Match start time
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Match Started!',
        body: `${match.home_team} vs ${match.away_team} is now live`,
        data: { matchId: match.id, type: 'match_start' },
        sound: true
      },
      trigger: matchDate
    });
  } catch (error) {
    console.error('Error scheduling match notifications:', error);
  }
};

export const sendGoalNotification = async (match, scorer, minute) => {
  if (!areNotificationsSupported()) {
    return; // Skip in Expo Go
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚽ GOAL!',
        body: `${scorer} scored in the ${minute}' minute!\n${match.home_team} ${match.home_score} - ${match.away_score} ${match.away_team}`,
        data: { matchId: match.id, type: 'goal', minute },
        sound: true
      },
      trigger: null // Send immediately
    });
  } catch (error) {
    console.error('Error sending goal notification:', error);
  }
};

export const sendMatchEndNotification = async (match, finalScore) => {
  if (!areNotificationsSupported()) {
    return; // Skip in Expo Go
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Match Finished',
        body: `Final Score: ${match.home_team} ${finalScore.home} - ${finalScore.away} ${match.away_team}`,
        data: { matchId: match.id, type: 'match_end' },
        sound: true
      },
      trigger: null // Send immediately
    });
  } catch (error) {
    console.error('Error sending match end notification:', error);
  }
};

export const registerNotificationToken = async (userId) => {
  if (!areNotificationsSupported()) {
    return null; // Skip in Expo Go
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    
    const token = await Notifications.getExpoPushTokenAsync();
    await sendNotificationToken({ userId, token: token.data });
    return token.data;
  } catch (error) {
    console.error('Error registering notification token:', error);
    return null;
  }
};

// Listen for notifications
export const setupNotificationListeners = async (navigation) => {
  if (!areNotificationsSupported()) {
    return () => {}; // Return empty cleanup function in Expo Go
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return () => {};
    
    // Handle notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.matchId && navigation) {
        navigation.navigate('MatchDetails', { matchId: data.matchId });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  } catch (error) {
    console.warn('Failed to setup notification listeners:', error.message);
    return () => {};
  }
};


