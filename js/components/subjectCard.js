/* ============================================
   DIPLOMA NOTES - SUBJECT CARD COMPONENT
   Renders subject cards on branch page
   ============================================ */

const SubjectCardComponent = {

  /**
   * Subject IDs that should open the Presentations page
   * instead of the regular Study Material page.
   * Add more subject IDs here if other branches also
   * get a similar "make your own presentation" subject.
   */
  PRESENTATION_SUBJECT_IDS: ['industry-training'],

  /**
   * Checks whether a subject should route to the
   * presentations page instead of study-material page.
   * @param {Object} subject - Subject data
   * @returns {boolean}
   */
  isPresentationSubject(subject) {
    return this.PRESENTATION_SUBJECT_IDS.includes(subject.id);
  },

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

    const goesToPresentations = this.isPresentationSubject(subject);

    // Add click handler
    card.addEventListener('click', (e) => {
      e.preventDefault();

      if (goesToPresentations) {
        // Industry Training -> Presentations page
        window.location.href = `presentations.html?branch=${branchId}&semester=${semester}&subject=${subject.id}`;
      } else {
        // Every other subject -> normal Study Material page (unchanged)
        window.location.href = `study-material.html?branch=${branchId}&semester=${semester}&subject=${subject.id}`;
      }

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

    // Meta line changes slightly for the presentations subject so
    // students know what they will find inside before clicking.
    const metaText = goesToPresentations
      ? `${subject.units || 0} Presentations · Preview & Download`
      : `${subject.units || 5} Units · Notes, Practicals, Videos & PYQs`;

    // Card content
    card.innerHTML = `
      <div class="subject-card-header">
        <h3 class="subject-card-title">
          ${subject.name}
          ${badgeHTML}
        </h3>
        <p class="subject-card-meta">${metaText}</p>
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