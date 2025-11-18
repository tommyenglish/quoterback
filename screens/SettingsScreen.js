import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import useSettingsStore from '../src/store/settingsStore';

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
    setNotificationTime,
    setNotificationCadence,
    toggleThemeBackground,
  } = useSettingsStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date(notificationTime));

  // Handle time change
  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setTempTime(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        setNotificationTime(selectedDate.toISOString());
      }
    }
  };

  // Handle test notification
  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification',
      'This is how your quote notification will appear!',
      [{ text: 'OK' }]
    );
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
                onPress={() => setNotificationCadence(option.value)}
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
                  onPress={() => toggleThemeBackground(theme.value)}
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

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Quote backgrounds will randomly vary between your selected themes. At least one theme must be selected.
        </Text>
      </View>
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
});
