import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import useFavoritesStore from '../src/store/favoritesStore';
import { getAllQuotes } from '../src/services/quoteService';

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite, isLoaded } = useFavoritesStore();
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);

  useEffect(() => {
    // Get all quotes and filter for favorites
    try {
      const allQuotes = getAllQuotes();
      const favQuotes = allQuotes.filter((quote) => favorites.includes(quote.id));
      setFavoriteQuotes(favQuotes);
    } catch (error) {
      console.error('Error loading favorite quotes:', error);
    }
  }, [favorites]);

  const handleRemoveFavorite = (quoteId) => {
    removeFavorite(quoteId);
  };

  const handleQuotePress = (quote) => {
    navigation.navigate('QuoteDetail', { quote });
  };

  const renderRightActions = (progress, dragX, quoteId) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveFavorite(quoteId)}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderQuoteItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item.id)
      }
    >
      <TouchableOpacity
        style={styles.quoteItem}
        onPress={() => handleQuotePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.quoteContent}>
          <Ionicons
            name="heart"
            size={20}
            color="#e91e63"
            style={styles.heartIcon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.quoteText} numberOfLines={3}>
              "{item.text}"
            </Text>
            <Text style={styles.authorText}>- {item.author}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => {
    if (!isLoaded) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Start adding quotes you love!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          favoriteQuotes.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heartIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
