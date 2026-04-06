/* ============================================
   DIPLOMA NOTES - UPDATE CARD COMPONENT
   Renders update cards (exam, job, result)
   ============================================ */

const UpdateCardComponent = {
  
  /**
   * Create an update card element
   * @param {Object} update - Update data
   * @returns {HTMLElement} Card element
   */
  create(update) {
    const card = document.createElement('div');
    card.className = 'update-card';
    card.style.borderLeftColor = this.getColorByType(update.type);
    
    // Add click handler if URL exists
    if (update.url) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        Router.openExternal(update.url);
      });
    }
    
    // Tag color
    const tagClass = update.type === 'exam' ? 'tag-exam' : 
                     update.type === 'job' ? 'tag-job' : 'tag-result';
    
    card.innerHTML = `
      <div class="update-card-content">
        <span class="tag ${tagClass}">${update.type}</span>
        <h3 class="update-card-title">${update.title}</h3>
      </div>
      <div class="update-card-date">
        ${Utils.formatDate(update.date)}
      </div>
    `;
    
    return card;
  },
  
  /**
   * Get border color by update type
   * @param {string} type - Update type
   * @returns {string} Color value
   */
  getColorByType(type) {
    switch (type) {
      case 'exam':
        return '#2563EB';
      case 'job':
        return '#10B981';
      case 'result':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  },
  
  /**
   * Render multiple update cards
   * @param {Array} updates - Array of update data
   * @param {string} containerId - Container element ID
   * @param {number} limit - Max number to show
   */
  render(updates, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Limit updates if specified
    const displayUpdates = limit ? updates.slice(0, limit) : updates;
    
    if (displayUpdates.length === 0) {
      this.showEmpty(containerId);
      return;
    }
    
    // Render cards
    displayUpdates.forEach(update => {
      const card = this.create(update);
      container.appendChild(card);
    });
  },
  
  /**
   * Show loading state
   * @param {string} containerId - Container element ID
   */
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="subjects-loading">
        <div class="subjects-loading-spinner"></div>
        <p>Loading updates...</p>
      </div>
    `;
  },
  
  /**
   * Show empty state
   * @param {string} containerId - Container element ID
   */
  showEmpty(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="content-empty">
        <div class="content-empty-icon">📢</div>
        <h3 class="content-empty-title">No updates yet</h3>
        <p class="content-empty-description">
          Check back later for exam notifications, job alerts, and results.
        </p>
      </div>
    `;
  }
};