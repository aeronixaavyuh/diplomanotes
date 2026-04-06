/* ============================================
   DIPLOMA NOTES - RECENTLY VIEWED COMPONENT
   Shows recently viewed subjects (device-specific limits)
   ============================================ */

const RecentlyViewedComponent = {
  
  /**
   * Create a recently viewed card
   * @param {Object} item - Recently viewed item
   * @returns {HTMLElement} Card element
   */
  create(item) {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'recently-viewed-card';
    
    // Add click handler
    card.addEventListener('click', (e) => {
      e.preventDefault();
      Router.toStudyMaterial(item.branchId, item.semester, item.subjectId);
    });
    
    // Format the label
    const label = `${item.branchName || 'Branch'} - Sem ${item.semester}`;
    
    card.innerHTML = `
      <h3 class="recently-viewed-card-title">${item.subjectName}</h3>
      <p class="recently-viewed-card-meta">
        ${label}
        <br>
        <small style="color: var(--color-gray-400);">Last opened</small>
      </p>
    `;
    
    return card;
  },
  
  /**
   * Get max items based on device
   * @returns {number} Max items to show
   */
  getMaxItems() {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 2 : 3;
  },
  
  /**
   * Render recently viewed section
   * @param {string} containerId - Container element ID
   * @param {string} sectionId - Section element ID
   */
  render(containerId, sectionId = 'recentlyViewedSection') {
    const container = document.getElementById(containerId);
    const section = document.getElementById(sectionId);
    
    if (!container) {
      console.error('Recently viewed container not found:', containerId);
      return;
    }
    
    // Get recently viewed items
    let items = StorageManager.getRecentlyViewed();
    
    // Limit items based on device
    const maxItems = this.getMaxItems();
    items = items.slice(0, maxItems);
    
    console.log(`Recently viewed: Showing ${items.length} of max ${maxItems} items`);
    
    // Hide section if no items
    if (items.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }
    
    // Show section
    if (section) section.style.display = 'block';
    
    // Clear container
    container.innerHTML = '';
    
    // Render cards
    items.forEach(item => {
      const card = this.create(item);
      container.appendChild(card);
    });
    
    // Re-render on window resize (device change)
    this.setupResizeHandler(containerId, sectionId);
  },
  
  /**
   * Setup resize handler to re-render on device change
   * @param {string} containerId - Container element ID
   * @param {string} sectionId - Section element ID
   */
  setupResizeHandler(containerId, sectionId) {
    // Debounce resize events
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        console.log('Window resized, re-rendering recently viewed...');
        this.render(containerId, sectionId);
      }, 300);
    };
    
    // Remove old listener if exists
    window.removeEventListener('resize', this._resizeHandler);
    
    // Add new listener
    this._resizeHandler = handleResize;
    window.addEventListener('resize', handleResize);
  }
};

// Debug log
console.log('RecentlyViewedComponent loaded');