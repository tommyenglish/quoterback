import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import QuoteCard from '../src/components/QuoteCard';
import { getAllQuotes } from '../src/services/quoteService';

export default function HomeScreen({ navigation }) {
  const [quotes, setQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(false);

  useEffect(() => {
    // Get all quotes and start at a random index
    const allQuotes = getAllQuotes();
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    setQuotes(allQuotes);
    setCurrentIndex(randomIndex);
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

  const handleNextQuote = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  const handlePreviousQuote = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length);
  };

  return (
    <TouchableWithoutFeedback onPress={toggleTabBar}>
      <View style={styles.container}>
        {quotes.length > 0 && (
          <QuoteCard
            quote={quotes[currentIndex]}
            controlsVisible={tabBarVisible}
            onSwipeLeft={handleNextQuote}
            onSwipeRight={handlePreviousQuote}
            key={quotes[currentIndex].id}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
