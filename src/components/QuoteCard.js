import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuoteCard({ quote }) {
  if (!quote) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.authorText}>- {quote.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '100%',
  },
  quoteText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
