/* ============================================
   DIPLOMA NOTES - BRANCH SUBJECTS PAGE LOGIC
   Handles semester selection and subject listing
   ============================================ */

const BranchSubjectsPage = {
  
  branchData: null,
  currentBranch: null,
  currentSemester: 1,
  subjectsData: null,
  
  /**
   * Initialize branch subjects page
   */
  async init() {
    // Get URL parameters
    const params = Router.getParams();
    this.currentBranch = params.branch;
    
    if (!this.currentBranch) {
      window.location.href = CONFIG.ROUTES.home;
      return;
    }
    
    // Get saved or URL semester
    this.currentSemester = params.semester || 
                           StorageManager.getSelectedSemester(this.currentBranch);
    
    // Load data
    await this.loadBranchData();
    await this.loadSubjectsData();
    
    // Setup UI
    this.updatePageHeader();
    this.setupSemesterTabs();
    this.renderSubjects();
    this.renderRecentlyViewed();
    
    // Save last visited
    StorageManager.saveLastVisited({
      page: 'branch-subjects',
      branchId: this.currentBranch,
      semester: this.currentSemester
    });
  },
  
  /**
   * Load branch data
   */
  async loadBranchData() {
    try {
      const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.branches);
      
      if (!data || !data.branches) {
        throw new Error('Invalid branch data');
      }
      
      this.branchData = data.branches.find(b => b.id === this.currentBranch);
      
      if (!this.branchData) {
        throw new Error('Branch not found');
      }
      
    } catch (error) {
      console.error('Error loading branch data:', error);
      Utils.showToast('Failed to load branch information', 'error');
    }
  },
  
  /**
   * Load subjects data
   */
  async loadSubjectsData() {
    try {
      const dataPath = CONFIG.DATA_PATHS.subjects[this.currentBranch];
      
      if (!dataPath) {
        throw new Error('No data path for branch');
      }
      
      const data = await Utils.fetchJSON(dataPath);
      
      if (!data || !data.semesters) {
        throw new Error('Invalid subjects data');
      }
      
      this.subjectsData = data;
      
    } catch (error) {
      console.error('Error loading subjects data:', error);
      this.subjectsData = null;
    }
  },
  
  /**
   * Update page header with branch info
   */
  updatePageHeader() {
    const titleElement = document.getElementById('branchTitle');
    const descElement = document.getElementById('branchDescription');
    
    if (this.branchData) {
      if (titleElement) {
        titleElement.textContent = `${this.branchData.name} — Semester-wise Subjects`;
      }
      if (descElement) {
        descElement.textContent = 'Select a semester to view subjects. Open any subject to access notes, practicals, videos, and PYQs.';
      }
    }
  },
  
  /**
   * Setup semester tabs
   */
  setupSemesterTabs() {
    const tabsContainer = document.getElementById('semesterTabs');
    if (!tabsContainer) return;
    
    // Clear existing tabs
    tabsContainer.innerHTML = '';
    
    // Get number of semesters (default 6)
    const numSemesters = this.branchData?.semesters?.length || 6;
    
    // Create tabs
    for (let i = 1; i <= numSemesters; i++) {
      const tab = document.createElement('button');
      tab.className = 'semester-tab';
      tab.setAttribute('data-semester', i);
      tab.textContent = `Sem ${i}`;
      
      if (i === this.currentSemester) {
        tab.classList.add('active');
      }
      
      tab.addEventListener('click', () => {
        this.changeSemester(i);
      });
      
      tabsContainer.appendChild(tab);
    }
  },
  
  /**
   * Change semester
   * @param {number} semester - Semester number
   */
  changeSemester(semester) {
    this.currentSemester = semester;
    
    // Update active tab
    const tabs = document.querySelectorAll('.semester-tab');
    tabs.forEach(tab => {
      if (parseInt(tab.getAttribute('data-semester')) === semester) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Save preference
    StorageManager.saveSelectedSemester(this.currentBranch, semester);
    
    // Update URL
    Router.updateParams({ semester });
    
    // Render subjects
    this.renderSubjects();
  },
  
  /**
   * Render subjects for current semester
   */
  renderSubjects() {
    const containerId = 'subjectsGrid';
    
    if (!this.subjectsData) {
      SubjectCardComponent.showEmpty(containerId);
      return;
    }
    
    // Find semester data
    const semesterData = this.subjectsData.semesters.find(
      s => s.number === this.currentSemester
    );
    
    if (!semesterData || !semesterData.subjects || semesterData.subjects.length === 0) {
      SubjectCardComponent.showEmpty(containerId);
      return;
    }
    
    // Hide empty state
    SubjectCardComponent.hideEmpty();
    
    // Add branch name to subjects
    const subjects = semesterData.subjects.map(s => ({
      ...s,
      branchName: this.branchData?.name || ''
    }));
    
    // Render subjects
    SubjectCardComponent.render(
      subjects,
      this.currentBranch,
      this.currentSemester,
      containerId
    );
  },
  
  /**
   * Render recently viewed section
   */
  renderRecentlyViewed() {
    RecentlyViewedComponent.render('recentlyViewedGrid', 'recentlyViewedSection');
  }
};

// Auto-initialize on branch subjects page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('branch-subjects.html')) {
      BranchSubjectsPage.init();
    }
  });
} else {
  if (window.location.pathname.endsWith('branch-subjects.html')) {
    BranchSubjectsPage.init();
  }
}