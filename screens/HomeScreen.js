import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, Text } from 'react-native';
import QuoteCard from '../src/components/QuoteCard';
import { getAllQuotes } from '../src/services/quoteService';
import useFavoritesStore from '../src/store/favoritesStore';
import useSettingsStore from '../src/store/settingsStore';

export default function HomeScreen({ navigation }) {
  const [quotes, setQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const favoritesLoaded = useFavoritesStore((state) => state.isLoaded);
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);

  useEffect(() => {
    // Get all quotes and start at a random index
    try {
      const allQuotes = getAllQuotes();
      if (allQuotes && allQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        setQuotes(allQuotes);
        setCurrentIndex(randomIndex);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if all data is loaded
  const allDataLoaded = favoritesLoaded && settingsLoaded && !isLoading;

  useEffect(() => {
    // Listen for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset tab bar to hidden when coming back to Home screen
      setTabBarVisible(false);
      navigation.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          height: 60,
          transform: [{ translateY: 100 }],
        },
      });
    });

    return unsubscribe;
  }, [navigation]);

  const toggleTabBar = () => {
    const newVisibility = !tabBarVisible;
    setTabBarVisible(newVisibility);

    if (newVisibility) {
      // Show the tab bar with slide-up animation
      navigation.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          height: 60,
          transform: [{ translateY: 0 }],
        },
      });
    } else {
      // Hide the tab bar with slide-down animation
      navigation.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          height: 60,
          transform: [{ translateY: 100 }],
        },
      });
    }
  };

  const handleNextQuote = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  const handlePreviousQuote = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length);
  };

  // Show loading indicator while data is being loaded
  if (!allDataLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading quotes...</Text>
      </View>
    );
  }

  // Show error message if no quotes are available
  if (quotes.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>No quotes available</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={toggleTabBar}>
      <View style={styles.container}>
        <QuoteCard
          quote={quotes[currentIndex]}
          controlsVisible={tabBarVisible}
          onSwipeLeft={handleNextQuote}
          onSwipeRight={handlePreviousQuote}
          key={quotes[currentIndex].id}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
});
