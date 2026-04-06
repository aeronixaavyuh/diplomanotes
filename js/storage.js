/* ============================================
   DIPLOMA NOTES - STORAGE MANAGER
   LocalStorage management and recently viewed tracking
   ============================================ */

const StorageManager = {
  
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  /**
   * Get data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  /**
   * Clear all localStorage
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
  
  /**
   * Save last visited page
   * @param {Object} pageData - Page information
   */
  saveLastVisited(pageData) {
    const data = {
      ...pageData,
      timestamp: Date.now()
    };
    this.set(CONFIG.STORAGE_KEYS.lastVisited, data);
  },
  
  /**
   * Get last visited page
   * @returns {Object|null} Last visited data
   */
  getLastVisited() {
    return this.get(CONFIG.STORAGE_KEYS.lastVisited);
  },
  
  /**
   * Add item to recently viewed
   * @param {Object} item - Item to add
   */
  addToRecentlyViewed(item) {
    const key = CONFIG.STORAGE_KEYS.recentlyViewed;
    let items = this.get(key, []);
    
    // Remove duplicates (same branch + semester + subject)
    items = items.filter(i => 
      !(i.branchId === item.branchId && 
        i.semester === item.semester && 
        i.subjectId === item.subjectId)
    );
    
    // Add new item at the beginning
    items.unshift({
      ...item,
      timestamp: Date.now()
    });
    
    // Keep only max items
    items = items.slice(0, CONFIG.DEFAULTS.maxRecentlyViewed);
    
    this.set(key, items);
  },
  
  /**
   * Get recently viewed items
   * @returns {Array} Recently viewed items
   */
  getRecentlyViewed() {
    return this.get(CONFIG.STORAGE_KEYS.recentlyViewed, []);
  },
  
  /**
   * Clear recently viewed
   */
  clearRecentlyViewed() {
    this.remove(CONFIG.STORAGE_KEYS.recentlyViewed);
  },
  
  /**
   * Save selected semester for a branch
   * @param {string} branchId - Branch ID
   * @param {number} semester - Semester number
   */
  saveSelectedSemester(branchId, semester) {
    const key = CONFIG.STORAGE_KEYS.selectedSemester;
    const data = this.get(key, {});
    data[branchId] = semester;
    this.set(key, data);
  },
  
  /**
   * Get selected semester for a branch
   * @param {string} branchId - Branch ID
   * @returns {number} Semester number
   */
  getSelectedSemester(branchId) {
    const key = CONFIG.STORAGE_KEYS.selectedSemester;
    const data = this.get(key, {});
    return data[branchId] || CONFIG.DEFAULTS.semester;
  },
  
  /**
   * Save selected tab for a subject
   * @param {string} subjectId - Subject ID
   * @param {string} tab - Tab name
   */
  saveSelectedTab(subjectId, tab) {
    const key = CONFIG.STORAGE_KEYS.selectedTab;
    const data = this.get(key, {});
    data[subjectId] = tab;
    this.set(key, data);
  },
  
  /**
   * Get selected tab for a subject
   * @param {string} subjectId - Subject ID
   * @returns {string} Tab name
   */
  getSelectedTab(subjectId) {
    const key = CONFIG.STORAGE_KEYS.selectedTab;
    const data = this.get(key, {});
    return data[subjectId] || CONFIG.DEFAULTS.tab;
  },
  
  /**
   * Toggle favorite
   * @param {string} id - Item ID
   * @param {Object} item - Item data
   * @returns {boolean} Is now favorited
   */
  toggleFavorite(id, item) {
    const key = CONFIG.STORAGE_KEYS.favorites;
    const favorites = this.get(key, {});
    
    if (favorites[id]) {
      delete favorites[id];
      this.set(key, favorites);
      return false;
    } else {
      favorites[id] = {
        ...item,
        timestamp: Date.now()
      };
      this.set(key, favorites);
      return true;
    }
  },
  
  /**
   * Check if item is favorited
   * @param {string} id - Item ID
   * @returns {boolean} Is favorited
   */
  isFavorite(id) {
    const key = CONFIG.STORAGE_KEYS.favorites;
    const favorites = this.get(key, {});
    return !!favorites[id];
  },
  
  /**
   * Get all favorites
   * @returns {Array} Favorite items
   */
  getFavorites() {
    const key = CONFIG.STORAGE_KEYS.favorites;
    const favorites = this.get(key, {});
    return Object.values(favorites);
  },
  
  /**
   * Save user preferences
   * @param {Object} preferences - User preferences
   */
  savePreferences(preferences) {
    const key = CONFIG.STORAGE_KEYS.userPreferences;
    const current = this.get(key, {});
    this.set(key, { ...current, ...preferences });
  },
  
  /**
   * Get user preferences
   * @returns {Object} User preferences
   */
  getPreferences() {
    return this.get(CONFIG.STORAGE_KEYS.userPreferences, {
      theme: 'light',
      fontSize: 'medium',
      notifications: true
    });
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}