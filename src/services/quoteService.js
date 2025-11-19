// Fallback quotes in case the main quotes.json fails to load
const FALLBACK_QUOTES = [
  {
    id: 'fallback-1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    topics: ['work', 'passion'],
    moods: ['motivated'],
  },
  {
    id: 'fallback-2',
    text: 'Believe you can and you\'re halfway there.',
    author: 'Theodore Roosevelt',
    topics: ['belief', 'success'],
    moods: ['motivated', 'hopeful'],
  },
  {
    id: 'fallback-3',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
    topics: ['action', 'time'],
    moods: ['motivated', 'peaceful'],
  },
];

// Try to import quotes data with error handling
let quotesData;
try {
  quotesData = require('../data/quotes.json');

  // Validate that quotesData is an array and has content
  if (!Array.isArray(quotesData) || quotesData.length === 0) {
    console.error('Quotes data is invalid or empty, using fallback quotes');
    quotesData = FALLBACK_QUOTES;
  }
} catch (error) {
  console.error('Error loading quotes.json, using fallback quotes:', error);
  quotesData = FALLBACK_QUOTES;
}

/**
 * Get a random quote from the quotes collection
 * @returns {Object} A random quote object
 */
export const getRandomQuote = () => {
  try {
    if (!quotesData || quotesData.length === 0) {
      return FALLBACK_QUOTES[0];
    }
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    return quotesData[randomIndex];
  } catch (error) {
    console.error('Error getting random quote:', error);
    return FALLBACK_QUOTES[0];
  }
};

/**
 * Get all quotes by a specific author
 * @param {string} author - The author name to filter by
 * @returns {Array} Array of quotes by the specified author
 */
export const getQuotesByAuthor = (author) => {
  try {
    if (!author) return [];
    return quotesData.filter(
      (quote) => quote.author?.toLowerCase() === author.toLowerCase()
    );
  } catch (error) {
    console.error('Error filtering quotes by author:', error);
    return [];
  }
};

/**
 * Get all quotes that include a specific topic
 * @param {string} topic - The topic to filter by
 * @returns {Array} Array of quotes containing the specified topic
 */
export const getQuotesByTopic = (topic) => {
  try {
    if (!topic) return [];
    return quotesData.filter((quote) =>
      quote.topics?.some((t) => t.toLowerCase() === topic.toLowerCase())
    );
  } catch (error) {
    console.error('Error filtering quotes by topic:', error);
    return [];
  }
};

/**
 * Get all quotes that match a specific mood
 * @param {string} mood - The mood to filter by
 * @returns {Array} Array of quotes matching the specified mood
 */
export const getQuotesByMood = (mood) => {
  try {
    if (!mood) return [];
    return quotesData.filter((quote) =>
      quote.moods?.some((m) => m.toLowerCase() === mood.toLowerCase())
    );
  } catch (error) {
    console.error('Error filtering quotes by mood:', error);
    return [];
  }
};

/**
 * Get all available quotes
 * @returns {Array} All quotes in the collection
 */
export const getAllQuotes = () => {
  try {
    return quotesData || FALLBACK_QUOTES;
  } catch (error) {
    console.error('Error getting all quotes:', error);
    return FALLBACK_QUOTES;
  }
};

/**
 * Get a random quote from a filtered set
 * @param {Array} quotes - Array of quotes to pick from
 * @returns {Object|null} A random quote from the array, or null if array is empty
 */
export const getRandomFromSet = (quotes) => {
  try {
    if (!quotes || quotes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  } catch (error) {
    console.error('Error getting random quote from set:', error);
    return null;
  }
};
