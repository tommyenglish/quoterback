import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllQuotes } from '../src/services/quoteService';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allQuotes, setAllQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null); // 'authors', 'topics', 'moods', or null

  useEffect(() => {
    // Load all quotes when component mounts
    const quotes = getAllQuotes();
    setAllQuotes(quotes);
    setFilteredQuotes(quotes);
  }, []);

  useEffect(() => {
    // Filter quotes based on search query
    if (searchQuery.trim() === '') {
      setFilteredQuotes(allQuotes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allQuotes.filter((quote) => {
        // Search in both quote text and author name
        const textMatch = quote.text.toLowerCase().includes(query);
        const authorMatch = quote.author.toLowerCase().includes(query);
        return textMatch || authorMatch;
      });
      setFilteredQuotes(filtered);
    }
  }, [searchQuery, allQuotes]);

  const handleQuotePress = (quote) => {
    navigation.navigate('QuoteDetail', { quote });
  };

  const handleFilterPress = (filterType) => {
    // For now, these are placeholders - will be implemented later
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  const renderQuoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.quoteItem}
      onPress={() => handleQuotePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.quoteContent}>
        <Text style={styles.quoteText} numberOfLines={3}>
          "{item.text}"
        </Text>
        <Text style={styles.authorText}>- {item.author}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No quotes found' : 'Search for quotes'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term'
          : 'Enter a keyword to search quotes and authors'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes or authors..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'authors' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('authors')}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={activeFilter === 'authors' ? '#fff' : '#4CAF50'}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'authors' && styles.filterButtonTextActive,
            ]}
          >
            Authors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'topics' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('topics')}
        >
          <Ionicons
            name="pricetag-outline"
            size={16}
            color={activeFilter === 'topics' ? '#fff' : '#4CAF50'}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'topics' && styles.filterButtonTextActive,
            ]}
          >
            Topics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'moods' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('moods')}
        >
          <Ionicons
            name="happy-outline"
            size={16}
            color={activeFilter === 'moods' ? '#fff' : '#4CAF50'}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'moods' && styles.filterButtonTextActive,
            ]}
          >
            Moods
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredQuotes.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
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
    marginRight: 12,
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
});
