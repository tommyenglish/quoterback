import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { backgrounds } from '../data/backgrounds';
import useFavoritesStore from '../store/favoritesStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

export default function QuoteCard({
  quote,
  controlsVisible = false,
  onSwipeLeft,
  onSwipeRight,
}) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  // Animation values
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const authorOpacity = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;

  if (!quote) {
    return null;
  }

  const isQuoteFavorite = isFavorite(quote.id);

  // Calculate font size based on quote length
  const getQuoteFontSize = () => {
    const length = quote.text.length;
    if (length < 50) return 36;
    if (length < 100) return 30;
    if (length < 150) return 26;
    if (length < 200) return 22;
    return 20;
  };

  // Calculate line height based on font size
  const getLineHeight = (fontSize) => {
    return fontSize * 1.4;
  };

  // Calculate max width based on quote length (shorter quotes = narrower)
  const getQuoteMaxWidth = () => {
    const length = quote.text.length;
    if (length < 50) return '70%';
    if (length < 100) return '80%';
    return '90%';
  };

  // Fade-in animation on mount
  useEffect(() => {
    // Reset opacities
    quoteOpacity.setValue(0);
    authorOpacity.setValue(0);

    // Animate quote first
    Animated.timing(quoteOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Then animate author
      Animated.timing(authorOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [quote.id]);

  // Controls visibility animation (faster for nav, slower for buttons)
  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: controlsVisible ? 1 : 0,
      duration: 200, // Fast transition for controls
      useNativeDriver: true,
    }).start();
  }, [controlsVisible]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - previous quote
          onSwipeRight && onSwipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - next quote
          onSwipeLeft && onSwipeLeft();
        }
      },
    })
  ).current;

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
    <View style={styles.container} {...panResponder.panHandlers}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        {/* Semi-transparent overlay */}
        <View style={styles.overlay} />

        {/* Centered quote content */}
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.quoteContainer,
              { maxWidth: getQuoteMaxWidth(), opacity: quoteOpacity },
            ]}
          >
            <Text
              style={[
                styles.quoteText,
                {
                  fontSize: getQuoteFontSize(),
                  lineHeight: getLineHeight(getQuoteFontSize()),
                },
              ]}
            >
              "{quote.text}"
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: authorOpacity }}>
            <Text style={styles.authorText}>— {quote.author}</Text>

            {/* Action buttons below author - with slower fade */}
            <Animated.View
              style={[
                styles.actionButtons,
                {
                  opacity: Animated.multiply(authorOpacity, controlsOpacity),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFavoritePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isQuoteFavorite ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isQuoteFavorite ? '#e91e63' : '#fff'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Placeholder for share functionality
                  console.log('Share quote');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  quoteText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authorText: {
    fontSize: 18,
    color: '#f0f0f0',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
