/* ============================================
   DIPLOMA NOTES - BRANCH CARD COMPONENT
   Renders branch cards on homepage
   ============================================ */

const BranchCardComponent = {
  
  /**
   * Create a branch card element
   * @param {Object} branch - Branch data
   * @returns {HTMLElement} Card element
   */
  create(branch) {
    const card = document.createElement('a');
    card.className = 'branch-card';
    card.setAttribute('data-branch-id', branch.id);
    
    // IMPORTANT: Set href directly instead of '#'
    card.href = `branch-subjects.html?branch=${branch.id}`;
    
    // Fallback: Also add click handler
    card.addEventListener('click', (e) => {
      // Let the default link behavior work, but also log for debugging
      console.log('Branch card clicked:', branch.id);
      console.log('Navigating to:', card.href);
    });
    
    // Card content
    card.innerHTML = `
      <div class="branch-card-image-wrapper">
        <img 
          src="${branch.image || 'assets/images/branches/placeholder.jpg'}" 
          alt="${branch.name}" 
          class="branch-card-image"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'"
        >
      </div>
      <h3 class="branch-card-title">${branch.name}</h3>
      <p class="branch-card-description">${branch.shortDesc}</p>
      <div class="branch-card-meta">
        <span>${branch.totalNotes || 0} Units · Notes, Practicals, Videos & PYQs</span>
      </div>
    `;
    
    return card;
  },
  
  /**
   * Render multiple branch cards
   * @param {Array} branches - Array of branch data
   * @param {string} containerId - Container element ID
   */
  render(branches, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    // Clear loading state
    container.innerHTML = '';
    
    if (!branches || branches.length === 0) {
      container.innerHTML = '<p>No branches available</p>';
      return;
    }
    
    // Render cards
    branches.forEach(branch => {
      const card = this.create(branch);
      container.appendChild(card);
    });
    
    console.log(`Rendered ${branches.length} branch cards`);
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
        <p>Loading branches...</p>
      </div>
    `;
  },
  
  /**
   * Show error state
   * @param {string} containerId - Container element ID
   * @param {string} message - Error message
   */
  showError(containerId, message = 'Failed to load branches') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="content-empty">
        <div class="content-empty-icon">⚠️</div>
        <h3 class="content-empty-title">Error</h3>
        <p class="content-empty-description">${message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }
};

// Debug: Log when this file loads
console.log('BranchCardComponent loaded');