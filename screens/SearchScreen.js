import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllQuotes } from '../src/services/quoteService';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allQuotes, setAllQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);

  useEffect(() => {
    // Load all quotes when component mounts
    const quotes = getAllQuotes();
    setAllQuotes(quotes);
    setFilteredQuotes(quotes);
  }, []);

  // Extract unique authors from all quotes
  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Set(allQuotes.map((quote) => quote.author));
    return Array.from(authorsSet).sort();
  }, [allQuotes]);

  useEffect(() => {
    // Filter quotes based on search query and selected authors
    let filtered = allQuotes;

    // Apply author filter if any authors are selected
    if (selectedAuthors.length > 0) {
      filtered = filtered.filter((quote) =>
        selectedAuthors.includes(quote.author)
      );
    }

    // Apply search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((quote) => {
        const textMatch = quote.text.toLowerCase().includes(query);
        const authorMatch = quote.author.toLowerCase().includes(query);
        return textMatch || authorMatch;
      });
    }

    setFilteredQuotes(filtered);
  }, [searchQuery, allQuotes, selectedAuthors]);

  const handleQuotePress = (quote) => {
    navigation.navigate('QuoteDetail', { quote });
  };

  const handleFilterPress = (filterType) => {
    if (filterType === 'authors') {
      setShowAuthorsModal(true);
    }
    // Topics and Moods will be implemented later
  };

  const handleAuthorToggle = (author) => {
    setSelectedAuthors((prev) => {
      if (prev.includes(author)) {
        return prev.filter((a) => a !== author);
      } else {
        return [...prev, author];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedAuthors([]);
  };

  const handleRemoveAuthorFilter = (author) => {
    setSelectedAuthors((prev) => prev.filter((a) => a !== author));
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
        {searchQuery || selectedAuthors.length > 0
          ? 'No quotes found'
          : 'Search for quotes'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedAuthors.length > 0
          ? 'Try adjusting your search or filters'
          : 'Enter a keyword to search quotes and authors'}
      </Text>
    </View>
  );

  const renderAuthorItem = ({ item: author }) => {
    const isSelected = selectedAuthors.includes(author);
    return (
      <TouchableOpacity
        style={styles.authorItem}
        onPress={() => handleAuthorToggle(author)}
        activeOpacity={0.7}
      >
        <View style={styles.authorItemContent}>
          <Text style={styles.authorItemText}>{author}</Text>
          <Text style={styles.authorItemCount}>
            {allQuotes.filter((q) => q.author === author).length} quotes
          </Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const hasActiveFilters = selectedAuthors.length > 0;

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
            selectedAuthors.length > 0 && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('authors')}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={selectedAuthors.length > 0 ? '#fff' : '#4CAF50'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedAuthors.length > 0 && styles.filterButtonTextActive,
            ]}
          >
            Authors
            {selectedAuthors.length > 0 && ` (${selectedAuthors.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => handleFilterPress('topics')}
        >
          <Ionicons
            name="pricetag-outline"
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.filterButtonText}>Topics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => handleFilterPress('moods')}
        >
          <Ionicons
            name="happy-outline"
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.filterButtonText}>Moods</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            {selectedAuthors.map((author) => (
              <View key={author} style={styles.filterChip}>
                <Ionicons name="person" size={14} color="#4CAF50" />
                <Text style={styles.filterChipText}>{author}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveAuthorFilter(author)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

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

      {/* Authors Filter Modal */}
      <Modal
        visible={showAuthorsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthorsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Authors</Text>
              <TouchableOpacity
                onPress={() => setShowAuthorsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Selected Count */}
            <View style={styles.modalSubHeader}>
              <Text style={styles.selectedCountText}>
                {selectedAuthors.length > 0
                  ? `${selectedAuthors.length} author${selectedAuthors.length > 1 ? 's' : ''} selected`
                  : 'Select one or more authors'}
              </Text>
              {selectedAuthors.length > 0 && (
                <TouchableOpacity onPress={handleClearFilters}>
                  <Text style={styles.clearLinkText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Authors List */}
            <FlatList
              data={uniqueAuthors}
              renderItem={renderAuthorItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.authorsListContainer}
              showsVerticalScrollIndicator={true}
            />

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowAuthorsModal(false)}
              >
                <Text style={styles.applyButtonText}>
                  Apply Filter{selectedAuthors.length > 0 ? ` (${selectedAuthors.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#666',
  },
  clearLinkText: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '600',
  },
  authorsListContainer: {
    paddingVertical: 8,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  authorItemContent: {
    flex: 1,
  },
  authorItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  authorItemCount: {
    fontSize: 12,
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
