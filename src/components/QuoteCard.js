import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { backgrounds } from '../data/backgrounds';
import useFavoritesStore from '../store/favoritesStore';

export default function QuoteCard({ quote, showFavoriteButton = false }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  if (!quote) {
    return null;
  }

  const isQuoteFavorite = isFavorite(quote.id);

  const handleFavoritePress = () => {
    if (isQuoteFavorite) {
      removeFavorite(quote.id);
    } else {
      addFavorite(quote.id);
    }
  };

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

        {/* Favorite button - positioned at top right */}
        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isQuoteFavorite ? 'heart' : 'heart-outline'}
              size={32}
              color={isQuoteFavorite ? '#e91e63' : '#fff'}
            />
          </TouchableOpacity>
        )}

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
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
