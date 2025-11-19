import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllQuotes, getRandomFromSet } from './quoteService';
import useQuoteUsageStore from '../store/quoteUsageStore';
import useSettingsStore from '../store/settingsStore';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification identifier for daily quotes
const DAILY_QUOTE_NOTIFICATION_ID = 'daily-quote-notification';

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} True if permissions granted, false otherwise
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-quotes', {
        name: 'Daily Quotes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get a random quote respecting filter preferences and usage tracking
 * Prioritizes least-used quotes to ensure variety
 * @returns {Object|null} Selected quote object or null if no quotes available
 */
export const getQuoteForNotification = () => {
  try {
    const {
      themeBackgrounds,
      notificationAuthors,
      notificationTopics,
      notificationMoods
    } = useSettingsStore.getState();
    const { getLeastUsedQuotes } = useQuoteUsageStore.getState();

    // Get all quotes
    let availableQuotes = getAllQuotes();

    // Apply author filter if any authors are selected
    if (notificationAuthors.length > 0) {
      availableQuotes = availableQuotes.filter((quote) =>
        notificationAuthors.includes(quote.author)
      );
    }

    // Apply topics filter if any topics are selected
    if (notificationTopics.length > 0) {
      availableQuotes = availableQuotes.filter((quote) =>
        quote.topics?.some((topic) => notificationTopics.includes(topic))
      );
    }

    // Apply moods filter if any moods are selected
    if (notificationMoods.length > 0) {
      availableQuotes = availableQuotes.filter((quote) =>
        quote.moods?.some((mood) => notificationMoods.includes(mood))
      );
    }

    // Filter by theme backgrounds (backgroundStyle in quotes)
    // Map theme preferences to backgroundStyle categories
    const themeMapping = {
      nature: 'nature',
      space: 'abstract',
      architecture: 'urban',
      art: 'abstract',
      urban: 'urban',
      vintage: 'minimal',
      'black & white': 'minimal',
      textures: 'abstract',
      minimalist: 'minimal',
    };

    // Get all matching background styles
    const allowedStyles = themeBackgrounds
      .map((theme) => themeMapping[theme])
      .filter(Boolean);

    // Filter quotes by background style if themes are set
    if (allowedStyles.length > 0) {
      availableQuotes = availableQuotes.filter((quote) =>
        allowedStyles.includes(quote.backgroundStyle)
      );
    }

    // If no quotes match the filters, fall back to all quotes
    if (availableQuotes.length === 0) {
      console.log('No quotes match the current filters, using all quotes');
      availableQuotes = getAllQuotes();
    }

    // Get the 5 least-used quotes from the available set
    const leastUsedQuotes = getLeastUsedQuotes(availableQuotes, 5);

    // Select a random quote from the least-used ones
    const selectedQuote = getRandomFromSet(leastUsedQuotes);

    return selectedQuote;
  } catch (error) {
    console.error('Error getting quote for notification:', error);
    // Fallback to a random quote
    return getRandomFromSet(getAllQuotes());
  }
};

/**
 * Calculate the trigger time for the next notification based on settings
 * @param {string} notificationTime - ISO string of the desired notification time
 * @param {string} cadence - 'daily', 'everyOtherDay', or 'weekly'
 * @returns {Object} Notification trigger configuration
 */
export const calculateNotificationTrigger = (notificationTime, cadence) => {
  const targetTime = new Date(notificationTime);
  const now = new Date();

  // Extract hour and minute from target time
  const hour = targetTime.getHours();
  const minute = targetTime.getMinutes();

  let trigger;

  switch (cadence) {
    case 'daily':
      // Trigger daily at the specified time
      trigger = {
        hour,
        minute,
        repeats: true,
      };
      break;

    case 'everyOtherDay':
      // Trigger every 2 days at the specified time
      // Calculate seconds until next trigger
      const nextTrigger = new Date();
      nextTrigger.setHours(hour, minute, 0, 0);

      // If the time has passed today, start from tomorrow
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 1);
      }

      trigger = {
        seconds: Math.floor((nextTrigger - now) / 1000),
        repeats: true,
        // Repeat every 2 days (172800 seconds)
      };
      break;

    case 'weekly':
      // Trigger weekly on the same day at the specified time
      const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
      trigger = {
        weekday: dayOfWeek + 1, // Expo uses 1-7 where 1 is Sunday
        hour,
        minute,
        repeats: true,
      };
      break;

    default:
      // Default to daily
      trigger = {
        hour,
        minute,
        repeats: true,
      };
  }

  return trigger;
};

/**
 * Schedule a daily notification based on user settings
 * @returns {Promise<string|null>} Notification identifier if successful, null otherwise
 */
export const scheduleDailyNotification = async () => {
  try {
    // Cancel any existing scheduled notifications first
    await cancelScheduledNotifications();

    const { notificationTime, notificationCadence } = useSettingsStore.getState();

    // Get a quote for the notification
    const quote = getQuoteForNotification();

    if (!quote) {
      console.error('No quote available for notification');
      return null;
    }

    // Calculate the trigger based on settings
    const trigger = calculateNotificationTrigger(notificationTime, notificationCadence);

    // For 'everyOtherDay', we need to use a different approach
    if (notificationCadence === 'everyOtherDay') {
      // Schedule with a time interval and manual rescheduling
      const targetTime = new Date(notificationTime);
      const now = new Date();
      const hour = targetTime.getHours();
      const minute = targetTime.getMinutes();

      const nextTrigger = new Date();
      nextTrigger.setHours(hour, minute, 0, 0);

      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 2);
      }

      const secondsUntilTrigger = Math.floor((nextTrigger - now) / 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: DAILY_QUOTE_NOTIFICATION_ID,
        content: {
          title: 'Your Daily Quote',
          body: `"${quote.text}" - ${quote.author}`,
          data: { quoteId: quote.id },
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'daily-quotes',
          }),
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: false,
        },
      });

      return notificationId;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: DAILY_QUOTE_NOTIFICATION_ID,
      content: {
        title: 'Your Daily Quote',
        body: `"${quote.text}" - ${quote.author}`,
        data: { quoteId: quote.id },
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: 'daily-quotes',
        }),
      },
      trigger,
    });

    console.log('Notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
    return null;
  }
};

/**
 * Cancel all scheduled notifications
 * @returns {Promise<void>}
 */
export const cancelScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications cancelled');
  } catch (error) {
    console.error('Error cancelling scheduled notifications:', error);
  }
};

/**
 * Send a test notification immediately
 * @returns {Promise<string|null>} Notification identifier if successful, null otherwise
 */
export const sendTestNotification = async () => {
  try {
    const quote = getQuoteForNotification();

    if (!quote) {
      console.error('No quote available for test notification');
      return null;
    }

    // Send notification immediately
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: `"${quote.text}" - ${quote.author}`,
        data: { quoteId: quote.id, isTest: true },
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: 'daily-quotes',
        }),
      },
      trigger: null, // null means send immediately
    });

    console.log('Test notification sent with ID:', notificationId);

    // Track the usage of this quote
    const { incrementUsage } = useQuoteUsageStore.getState();
    incrementUsage(quote.id);

    return notificationId;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return null;
  }
};

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} Array of scheduled notifications
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Handle notification received (when app is in foreground or background)
 * This should be called when setting up notification listeners
 */
export const handleNotificationReceived = (notification) => {
  console.log('Notification received:', notification);

  // Track quote usage if this is a quote notification
  const quoteId = notification.request.content.data?.quoteId;
  if (quoteId) {
    const { incrementUsage } = useQuoteUsageStore.getState();
    incrementUsage(quoteId);
  }
};

/**
 * Handle notification response (when user taps on notification)
 * This should be called when setting up notification listeners
 */
export const handleNotificationResponse = (response) => {
  console.log('Notification tapped:', response);

  // You can add navigation logic here if needed
  // For example, navigate to the quote detail screen
  const quoteId = response.notification.request.content.data?.quoteId;
  if (quoteId) {
    // Navigation logic can be added here
    console.log('User tapped notification for quote:', quoteId);
  }
};

/**
 * Reschedule notification based on current settings
 * Call this whenever settings change
 * @returns {Promise<void>}
 */
export const rescheduleNotification = async () => {
  try {
    await cancelScheduledNotifications();
    await scheduleDailyNotification();
    console.log('Notification rescheduled based on new settings');
  } catch (error) {
    console.error('Error rescheduling notification:', error);
  }
};
