import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { backgrounds } from '../data/backgrounds';

export default function QuoteCard({ quote }) {
  if (!quote) {
    return null;
  }

  // Get the background image based on the quote's backgroundStyle
  const backgroundImage = backgrounds[quote.backgroundStyle] || backgrounds.minimal;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        {/* Semi-transparent dark overlay at the bottom */}
        <View style={styles.overlay} />

        {/* Content container */}
        <View style={styles.contentContainer}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.authorText}>- {quote.author}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: '100%',
    minHeight: 300,
  },
  backgroundImage: {
    width: '100%',
    minHeight: 300,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    // Gradient effect - darker at the bottom
    opacity: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 32,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  quoteText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authorText: {
    fontSize: 14,
    color: '#f0f0f0',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
