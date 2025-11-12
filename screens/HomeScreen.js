import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuoteCard from '../src/components/QuoteCard';
import { getRandomQuote } from '../src/services/quoteService';

export default function HomeScreen() {
  const [randomQuote, setRandomQuote] = useState(null);

  useEffect(() => {
    // Select a random quote using the quote service
    setRandomQuote(getRandomQuote());
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quoterback</Text>
      <Text style={styles.subtitle}>Your Daily Dose of Inspiration</Text>
      {randomQuote && <QuoteCard quote={randomQuote} />}
    </View>
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
