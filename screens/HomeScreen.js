import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import QuoteCard from '../src/components/QuoteCard';
import { getRandomQuote } from '../src/services/quoteService';

export default function HomeScreen({ navigation }) {
  const [randomQuote, setRandomQuote] = useState(null);
  const [tabBarVisible, setTabBarVisible] = useState(false);

  useEffect(() => {
    // Select a random quote using the quote service
    setRandomQuote(getRandomQuote());
  }, []);

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

  return (
    <TouchableWithoutFeedback onPress={toggleTabBar}>
      <View style={styles.container}>
        <Text style={styles.title}>Quoterback</Text>
        <Text style={styles.subtitle}>Your Daily Dose of Inspiration</Text>
        {randomQuote && <QuoteCard quote={randomQuote} showFavoriteButton={tabBarVisible} />}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
});
