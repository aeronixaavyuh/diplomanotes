/* ============================================
   DIPLOMA NOTES - STUDY TABS COMPONENT
   Manages tabs on study material page
   ============================================ */

const StudyTabsComponent = {
  
  activeTab: 'notes',
  
  /**
   * Initialize tabs
   * @param {string} defaultTab - Default active tab
   */
  init(defaultTab = 'notes') {
    this.activeTab = defaultTab;
    this.setupTabButtons();
    this.activateTab(defaultTab);
  },
  
  /**
   * Setup tab button click handlers
   */
  setupTabButtons() {
    const tabButtons = document.querySelectorAll('.study-tab');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        this.activateTab(tabName);
      });
    });
  },
  
  /**
   * Activate a specific tab
   * @param {string} tabName - Tab name to activate
   */
  activateTab(tabName) {
    // Update active tab
    this.activeTab = tabName;
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.study-tab');
    tabButtons.forEach(button => {
      if (button.getAttribute('data-tab') === tabName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.study-tab-content');
    tabContents.forEach(content => {
      if (content.id === `${tabName}Tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Update URL
    Router.updateParams({ tab: tabName });
    
    // Trigger custom event
    const event = new CustomEvent('tabChanged', { 
      detail: { tab: tabName } 
    });
    document.dispatchEvent(event);
  },
  
  /**
   * Get current active tab
   * @returns {string} Active tab name
   */
  getActiveTab() {
    return this.activeTab;
  }
};