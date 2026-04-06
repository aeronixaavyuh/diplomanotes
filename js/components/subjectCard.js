/* ============================================
   DIPLOMA NOTES - SUBJECT CARD COMPONENT
   Renders subject cards on branch page
   ============================================ */

const SubjectCardComponent = {
  
  /**
   * Create a subject card element
   * @param {Object} subject - Subject data
   * @param {string} branchId - Branch ID
   * @param {number} semester - Semester number
   * @returns {HTMLElement} Card element
   */
  create(subject, branchId, semester) {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'subject-card';
    
    // Add special styling for open elective/mandatory courses
    if (subject.type === 'open-elective' || subject.type === 'mandatory') {
      card.classList.add('subject-card-special');
    }
    
    card.setAttribute('data-subject-id', subject.id);
    
    // Add click handler
    card.addEventListener('click', (e) => {
      e.preventDefault();
      Router.toStudyMaterial(branchId, semester, subject.id);
      
      // Save to recently viewed
      StorageManager.addToRecentlyViewed({
        branchId,
        branchName: subject.branchName || '',
        semester,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code
      });
    });
    
    // Build badge HTML
    let badgeHTML = '';
    if (subject.type === 'open-elective') {
      badgeHTML = '<span class="special-badge">Open Elective</span>';
    } else if (subject.type === 'mandatory') {
      badgeHTML = '<span class="special-badge" style="background-color: var(--color-accent-orange);">Mandatory</span>';
    }
    
    // Card content
    card.innerHTML = `
      <div class="subject-card-header">
        <h3 class="subject-card-title">
          ${subject.name}
          ${badgeHTML}
        </h3>
        <p class="subject-card-meta">${subject.units || 5} Units · Notes, Practicals, Videos & PYQs</p>
      </div>
      ${subject.description ? `
        <p class="subject-card-units">${Utils.truncate(subject.description, 80)}</p>
      ` : ''}
    `;
    
    return card;
  },
  
  /**
   * Render multiple subject cards
   * @param {Array} subjects - Array of subject data
   * @param {string} branchId - Branch ID
   * @param {number} semester - Semester number
   * @param {string} containerId - Container element ID
   */
  render(subjects, branchId, semester, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (!subjects || subjects.length === 0) {
      this.showEmpty(containerId);
      return;
    }
    
    // Render cards
    subjects.forEach(subject => {
      const card = this.create(subject, branchId, semester);
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
        <p>Loading subjects...</p>
      </div>
    `;
  },
  
  /**
   * Show empty state
   * @param {string} containerId - Container element ID
   */
  showEmpty(containerId) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById('subjectsEmpty');
    
    if (container) {
      container.innerHTML = '';
    }
    
    if (emptyState) {
      emptyState.style.display = 'block';
    }
  },
  
  /**
   * Hide empty state
   */
  hideEmpty() {
    const emptyState = document.getElementById('subjectsEmpty');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
};