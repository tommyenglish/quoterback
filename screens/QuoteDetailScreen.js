import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QuoteCard from '../src/components/QuoteCard';
import useFavoritesStore from '../src/store/favoritesStore';

export default function QuoteDetailScreen({ route, navigation }) {
  const { quote } = route.params;
  const { isFavorite, removeFavorite, addFavorite } = useFavoritesStore();
  const isQuoteFavorite = isFavorite(quote.id);

  const handleToggleFavorite = () => {
    try {
      if (isQuoteFavorite) {
        removeFavorite(quote.id);
        // Optionally navigate back if unfavorited
        navigation.goBack();
      } else {
        addFavorite(quote.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert(
        'Error',
        'Unable to update favorites. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `"${quote.text}"\n\n- ${quote.author}`,
      });

      // Note: result.action is only available on some platforms
      if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share this quote. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <QuoteCard quote={quote} />

        <View style={styles.metaContainer}>
          {quote.topics && quote.topics.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Topics</Text>
              <View style={styles.tagsContainer}>
                {quote.topics.map((topic, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {quote.moods && quote.moods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Moods</Text>
              <View style={styles.tagsContainer}>
                {quote.moods.map((mood, index) => (
                  <View key={index} style={[styles.tag, styles.moodTag]}>
                    <Text style={styles.tagText}>{mood}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isQuoteFavorite ? styles.unfavoriteButton : styles.favoriteButton,
          ]}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isQuoteFavorite ? 'heart-dislike' : 'heart'}
            size={24}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {isQuoteFavorite ? 'Unfavorite' : 'Favorite'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  metaContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodTag: {
    backgroundColor: '#2196F3',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  favoriteButton: {
    backgroundColor: '#e91e63',
  },
  unfavoriteButton: {
    backgroundColor: '#757575',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
