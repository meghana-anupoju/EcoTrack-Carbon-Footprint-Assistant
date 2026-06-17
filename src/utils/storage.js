/**
 * Storage key for the application.
 * @constant {string}
 */
const STORAGE_KEY = 'ecotrack_history';

/**
 * Retrieves the user's footprint history from localStorage.
 * @returns {Array<Object>} The parsed history array.
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
}

/**
 * Saves a new footprint record to the history.
 * @param {Object} footprintData - The calculated emissions data.
 */
export function saveToHistory(footprintData) {
  try {
    const history = getHistory();
    const newRecord = {
      date: new Date().toISOString(),
      ...footprintData
    };
    
    history.push(newRecord);
    // Keep only the last 30 entries to prevent local storage bloat
    if (history.length > 30) history.shift();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
}

/**
 * Gets the most recent footprint record.
 * @returns {Object|null} The latest record or null if empty.
 */
export function getLatestRecord() {
  const history = getHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}
