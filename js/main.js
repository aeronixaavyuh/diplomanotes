/* ============================================
   DIPLOMA NOTES - MAIN APP
   Global initialization
   ============================================ */

const App = {
  
  /**
   * Initialize application
   */
  init() {
    // Initialize navbar (always)
    NavbarComponent.init();
    
    // Setup global error handling
    this.setupErrorHandling();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Log app start
    console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initialized`);
  },
  
  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  },
  
  /**
   * Setup lazy loading for images
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.getAttribute('src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });
      
      // Observe all lazy-loadable images
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}