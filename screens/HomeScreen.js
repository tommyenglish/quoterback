import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quoterback</Text>
      <Text style={styles.subtitle}>Your Daily Dose of Inspiration</Text>
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>
          "The only way to do great work is to love what you do."
        </Text>
        <Text style={styles.authorText}>- Steve Jobs</Text>
      </View>
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
  quoteContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
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
    fontSize: 18,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});
