/* ============================================
   DIPLOMA NOTES - ROUTER
   URL routing and navigation
   ============================================ */

const Router = {
  
  /**
   * Navigate to branch subjects page
   * @param {string} branchId - Branch ID
   * @param {number} semester - Semester number (optional)
   */
  toBranchSubjects(branchId, semester = null) {
    const url = new URL(CONFIG.ROUTES.branches, window.location.origin);
    url.searchParams.set('branch', branchId);
    if (semester) {
      url.searchParams.set('semester', semester);
    }
    window.location.href = url.toString();
  },
  
  /**
   * Navigate to study material page
   * @param {string} branchId - Branch ID
   * @param {number} semester - Semester number
   * @param {string} subjectId - Subject ID
   * @param {string} tab - Tab name (optional)
   */
  toStudyMaterial(branchId, semester, subjectId, tab = null) {
    const url = new URL(CONFIG.ROUTES.studyMaterial, window.location.origin);
    url.searchParams.set('branch', branchId);
    url.searchParams.set('semester', semester);
    url.searchParams.set('subject', subjectId);
    if (tab) {
      url.searchParams.set('tab', tab);
    }
    window.location.href = url.toString();
  },
  
  /**
   * Get current route parameters
   * @returns {Object} Route parameters
   */
  getParams() {
    return {
      branch: Utils.getUrlParam('branch'),
      semester: parseInt(Utils.getUrlParam('semester')) || null,
      subject: Utils.getUrlParam('subject'),
      tab: Utils.getUrlParam('tab')
    };
  },
  
  /**
   * Update URL without page reload
   * @param {Object} params - Parameters to update
   */
  updateParams(params) {
    Utils.setUrlParams(params);
  },
  
  /**
   * Go back to previous page
   */
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = CONFIG.ROUTES.home;
    }
  },
  
  /**
   * Build URL for external links
   * @param {string} type - Link type
   * @param {Object} params - Additional parameters
   * @returns {string} URL
   */
  buildExternalUrl(type, params = {}) {
    const baseUrl = CONFIG.EXTERNAL_LINKS[type];
    if (!baseUrl) return '#';
    
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });
    return url.toString();
  },
  
  /**
   * Open external link in new tab
   * @param {string} url - URL to open
   */
  openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}