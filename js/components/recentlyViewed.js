/* ============================================
   DIPLOMA NOTES - RECENTLY VIEWED COMPONENT
   Shows recently viewed subjects
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
   * Render recently viewed section
   * @param {string} containerId - Container element ID
   * @param {string} sectionId - Section element ID
   */
  render(containerId, sectionId = 'recentlyViewedSection') {
    const container = document.getElementById(containerId);
    const section = document.getElementById(sectionId);
    
    if (!container) return;
    
    // Get recently viewed items
    const items = StorageManager.getRecentlyViewed();
    
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
  }
};