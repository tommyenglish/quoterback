import quotesData from '../data/quotes.json';

/**
 * Get a random quote from the quotes collection
 * @returns {Object} A random quote object
 */
export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotesData.length);
  return quotesData[randomIndex];
};

/**
 * Get all quotes by a specific author
 * @param {string} author - The author name to filter by
 * @returns {Array} Array of quotes by the specified author
 */
export const getQuotesByAuthor = (author) => {
  if (!author) return [];
  return quotesData.filter(
    (quote) => quote.author.toLowerCase() === author.toLowerCase()
  );
};

/**
 * Get all quotes that include a specific topic
 * @param {string} topic - The topic to filter by
 * @returns {Array} Array of quotes containing the specified topic
 */
export const getQuotesByTopic = (topic) => {
  if (!topic) return [];
  return quotesData.filter((quote) =>
    quote.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
  );
};

/**
 * Get all quotes that match a specific mood
 * @param {string} mood - The mood to filter by
 * @returns {Array} Array of quotes matching the specified mood
 */
export const getQuotesByMood = (mood) => {
  if (!mood) return [];
  return quotesData.filter((quote) =>
    quote.moods.some((m) => m.toLowerCase() === mood.toLowerCase())
  );
};

/**
 * Get all available quotes
 * @returns {Array} All quotes in the collection
 */
export const getAllQuotes = () => {
  return quotesData;
};

/**
 * Get a random quote from a filtered set
 * @param {Array} quotes - Array of quotes to pick from
 * @returns {Object|null} A random quote from the array, or null if array is empty
 */
export const getRandomFromSet = (quotes) => {
  if (!quotes || quotes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
