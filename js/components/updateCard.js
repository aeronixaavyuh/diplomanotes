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
    if (update.url && update.url.trim() !== '') {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        // Better external handling
        window.open(update.url, '_blank', 'noopener,noreferrer');
      });
    }
    
    // Tag class
    const tagClass = update.type === 'exam' ? 'tag-exam' : 
                     update.type === 'job' ? 'tag-job' : 'tag-result';
    
    // Safe data handling
    const title = Utils.sanitizeHTML(update.title || '');
    const description = Utils.sanitizeHTML(update.description || '');
    
    card.innerHTML = `
      <div class="update-card-content">
        <span class="tag ${tagClass}">${update.type}</span>
        
        <h3 class="update-card-title">${title}</h3>
        
        ${description ? `
          <p class="update-card-description">${description}</p>
        ` : ''}
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
    
    container.innerHTML = '';
    
    const displayUpdates = limit ? updates.slice(0, limit) : updates;
    
    if (!displayUpdates || displayUpdates.length === 0) {
      this.showEmpty(containerId);
      return;
    }
    
    displayUpdates.forEach(update => {
      const card = this.create(update);
      container.appendChild(card);
    });
  },
  
  /**
   * Show loading state
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