import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import AppNavigator from './navigation/AppNavigator';
import {
  requestNotificationPermissions,
  handleNotificationReceived,
  handleNotificationResponse,
  scheduleDailyNotification,
} from './src/services/notificationService';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request notification permissions and schedule notifications on app start
    const initializeNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();

      if (hasPermission) {
        // Schedule the daily notification if permissions granted
        await scheduleDailyNotification();
      }
    };

    initializeNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
