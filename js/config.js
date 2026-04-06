/* ============================================
   DIPLOMA NOTES - CONFIGURATION
   Constants, API endpoints, settings
   ============================================ */

const CONFIG = {
  // App Info
  APP_NAME: 'Diploma Notes',
  VERSION: '1.0.0',
  
  // Data Endpoints
  DATA_PATHS: {
    branches: 'data/branches.json',
    updates: 'data/updates.json',
    contributors: 'data/contributors.json',
    subjects: {
      electrical: 'data/subjects/electrical.json',
      mechanical: 'data/subjects/mechanical.json',
      chemical: 'data/subjects/chemical.json'
    },
    studyMaterial: 'data/study-material/' // Base path
  },
  
  // LocalStorage Keys
  STORAGE_KEYS: {
    lastVisited: 'diploma_last_visited',
    recentlyViewed: 'diploma_recently_viewed',
    selectedSemester: 'diploma_selected_semester',
    selectedTab: 'diploma_selected_tab',
    favorites: 'diploma_favorites',
    userPreferences: 'diploma_preferences'
  },
  
  // Default Settings
  DEFAULTS: {
    semester: 1,
    tab: 'notes',
    maxRecentlyViewed: 6, // Maximum in storage
    maxRecentlyViewedMobile: 2, // Display limit on mobile
    maxRecentlyViewedDesktop: 3 // Display limit on desktop
  },
  
  // External Links
  EXTERNAL_LINKS: {
    collegeWebsite: 'https://example.com',
    virtualLab: 'https://vlab.co.in/',
    youtubeChannel: 'https://youtube.com/@diplomalabs'
  },
  
  // Route Patterns
  ROUTES: {
    home: 'index.html',
    branches: 'branch-subjects.html',
    studyMaterial: 'study-material.html',
    updates: 'updates.html',
    about: 'about.html'
  },
  
  // Feature Flags
  FEATURES: {
    darkMode: false,
    offlineMode: false,
    analytics: false
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}