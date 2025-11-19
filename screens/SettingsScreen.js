import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import useSettingsStore from '../src/store/settingsStore';
import { sendTestNotification, rescheduleNotification } from '../src/services/notificationService';
import { getAllQuotes } from '../src/services/quoteService';

// Mood emoji mapping
const MOOD_EMOJIS = {
  anxious: '😰',
  grateful: '😊',
  motivated: '💪',
  peaceful: '😌',
  sad: '😢',
  angry: '😠',
  happy: '😃',
};

const CADENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'everyOtherDay', label: 'Every Other Day' },
  { value: 'weekly', label: 'Weekly' },
];

const THEME_OPTIONS = [
  { value: 'nature', label: 'Nature', icon: 'leaf-outline' },
  { value: 'space', label: 'Space', icon: 'planet-outline' },
  { value: 'architecture', label: 'Architecture', icon: 'business-outline' },
  { value: 'art', label: 'Art', icon: 'color-palette-outline' },
  { value: 'urban', label: 'Urban', icon: 'city-outline' },
  { value: 'vintage', label: 'Vintage', icon: 'camera-outline' },
  { value: 'blackAndWhite', label: 'Black & White', icon: 'contrast-outline' },
  { value: 'textures', label: 'Textures', icon: 'grid-outline' },
  { value: 'minimalist', label: 'Minimalist', icon: 'remove-outline' },
];

export default function SettingsScreen() {
  const {
    notificationTime,
    notificationCadence,
    themeBackgrounds,
    notificationAuthors,
    notificationTopics,
    notificationMoods,
    setNotificationTime,
    setNotificationCadence,
    toggleThemeBackground,
    toggleNotificationAuthor,
    toggleNotificationTopic,
    toggleNotificationMood,
    clearNotificationFilters,
  } = useSettingsStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date(notificationTime));
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [showMoodsModal, setShowMoodsModal] = useState(false);

  // Get all quotes to extract unique values
  const allQuotes = useMemo(() => getAllQuotes(), []);

  // Extract unique authors from all quotes
  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Set(allQuotes.map((quote) => quote.author));
    return Array.from(authorsSet).sort();
  }, [allQuotes]);

  // Extract unique topics from all quotes
  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set();
    allQuotes.forEach((quote) => {
      quote.topics?.forEach((topic) => topicsSet.add(topic));
    });
    return Array.from(topicsSet).sort();
  }, [allQuotes]);

  // Extract unique moods from all quotes
  const uniqueMoods = useMemo(() => {
    const moodsSet = new Set();
    allQuotes.forEach((quote) => {
      quote.moods?.forEach((mood) => moodsSet.add(mood));
    });
    return Array.from(moodsSet).sort();
  }, [allQuotes]);

  // Handle time change
  const handleTimeChange = async (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setTempTime(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        setNotificationTime(selectedDate.toISOString());
        // Reschedule notification with new time
        await rescheduleNotification();
      }
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      const notificationId = await sendTestNotification();
      if (notificationId) {
        Alert.alert(
          'Test Notification Sent',
          'A test notification has been sent! Check your notification panel.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to send test notification. Please check notification permissions.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        'Error',
        'An error occurred while sending the test notification.',
        [{ text: 'OK' }]
      );
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Settings</Text>

      {/* Notification Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>

        {/* Notification Time */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notification Time</Text>
              <Text style={styles.settingDescription}>
                When to receive daily quote
              </Text>
            </View>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.timeButtonText}>
                {formatTime(notificationTime)}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Notification Cadence */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notification Cadence</Text>
            <Text style={styles.settingDescription}>
              How often to receive quotes
            </Text>
          </View>

          <View style={styles.cadenceOptions}>
            {CADENCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.cadenceOption,
                  notificationCadence === option.value && styles.cadenceOptionSelected,
                ]}
                onPress={async () => {
                  setNotificationCadence(option.value);
                  await rescheduleNotification();
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioButton,
                  notificationCadence === option.value && styles.radioButtonSelected,
                ]}>
                  {notificationCadence === option.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.cadenceOptionText,
                    notificationCadence === option.value && styles.cadenceOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Notification Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
          activeOpacity={0.7}
        >
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Background Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="image-outline" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Theme Background</Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Background Themes</Text>
            <Text style={styles.settingDescription}>
              Select one or more themes for quote backgrounds
            </Text>
          </View>

          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((theme) => {
              const isSelected = themeBackgrounds.includes(theme.value);
              return (
                <TouchableOpacity
                  key={theme.value}
                  style={[
                    styles.themeOption,
                    isSelected && styles.themeOptionSelected,
                  ]}
                  onPress={async () => {
                    toggleThemeBackground(theme.value);
                    await rescheduleNotification();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={theme.icon}
                    size={28}
                    color={isSelected ? '#4CAF50' : '#666'}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      isSelected && styles.themeOptionTextSelected,
                    ]}
                  >
                    {theme.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Notification Filters Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="filter-outline" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Notification Filters</Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Quote Preferences</Text>
            <Text style={styles.settingDescription}>
              Optionally filter quotes for notifications by author, topic, or mood. Leave empty for random quotes from all categories.
            </Text>
          </View>

          {/* Authors Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAuthorsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonLeft}>
              <Ionicons name="person-outline" size={20} color="#4CAF50" />
              <Text style={styles.filterButtonLabel}>Authors</Text>
            </View>
            <View style={styles.filterButtonRight}>
              <Text style={styles.filterCount}>
                {notificationAuthors.length > 0 ? notificationAuthors.length : 'All'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Topics Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowTopicsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonLeft}>
              <Ionicons name="pricetag-outline" size={20} color="#4CAF50" />
              <Text style={styles.filterButtonLabel}>Topics</Text>
            </View>
            <View style={styles.filterButtonRight}>
              <Text style={styles.filterCount}>
                {notificationTopics.length > 0 ? notificationTopics.length : 'All'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Moods Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowMoodsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonLeft}>
              <Ionicons name="happy-outline" size={20} color="#4CAF50" />
              <Text style={styles.filterButtonLabel}>Moods</Text>
            </View>
            <View style={styles.filterButtonRight}>
              <Text style={styles.filterCount}>
                {notificationMoods.length > 0 ? notificationMoods.length : 'All'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Clear Filters Button */}
          {(notificationAuthors.length > 0 || notificationTopics.length > 0 || notificationMoods.length > 0) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={async () => {
                clearNotificationFilters();
                await rescheduleNotification();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FF5252" />
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Quote backgrounds will randomly vary between your selected themes. At least one theme must be selected.
        </Text>
      </View>

      {/* Authors Modal */}
      <Modal
        visible={showAuthorsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthorsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Authors</Text>
              <TouchableOpacity onPress={() => setShowAuthorsModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={uniqueAuthors}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = notificationAuthors.includes(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={async () => {
                      toggleNotificationAuthor(item);
                      await rescheduleNotification();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Topics Modal */}
      <Modal
        visible={showTopicsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Topics</Text>
              <TouchableOpacity onPress={() => setShowTopicsModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={uniqueTopics}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = notificationTopics.includes(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={async () => {
                      toggleNotificationTopic(item);
                      await rescheduleNotification();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Moods Modal */}
      <Modal
        visible={showMoodsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoodsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Moods</Text>
              <TouchableOpacity onPress={() => setShowMoodsModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={uniqueMoods}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = notificationMoods.includes(item);
                const emoji = MOOD_EMOJIS[item] || '😊';
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={async () => {
                      toggleNotificationMood(item);
                      await rescheduleNotification();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.moodItemContent}>
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.modalItemText,
                          isSelected && styles.modalItemTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cadenceOptions: {
    marginTop: 16,
    gap: 8,
  },
  cadenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cadenceOptionSelected: {
    backgroundColor: '#f0f9f0',
    borderColor: '#4CAF50',
  },
  cadenceOptionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  cadenceOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  themeOption: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  themeOptionSelected: {
    backgroundColor: '#f0f9f0',
    borderColor: '#4CAF50',
  },
  themeOptionText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 13,
  },
  themeOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  footer: {
    marginTop: 8,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5252',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemSelected: {
    backgroundColor: '#f0f9f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  moodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodEmoji: {
    fontSize: 24,
  },
});
