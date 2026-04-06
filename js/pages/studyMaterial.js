/* ============================================
   DIPLOMA NOTES - STUDY MATERIAL PAGE LOGIC
   Handles study material tabs and content
   ============================================ */

const StudyMaterialPage = {
  
  branchId: null,
  semester: null,
  subjectId: null,
  branchData: null,
  subjectData: null,
  materialData: null,
  
  /**
   * Initialize study material page
   */
  async init() {
    // Get URL parameters
    const params = Router.getParams();
    this.branchId = params.branch;
    this.semester = params.semester;
    this.subjectId = params.subject;
    
    if (!this.branchId || !this.semester || !this.subjectId) {
      window.location.href = CONFIG.ROUTES.home;
      return;
    }
    
    // Get saved or URL tab
    const savedTab = StorageManager.getSelectedTab(this.subjectId);
    const currentTab = params.tab || savedTab;
    
    // Load data
    await this.loadBranchData();
    await this.loadSubjectData();
    await this.loadMaterialData();
    
    // Setup UI
    this.updateBreadcrumb();
    this.updatePageHeader();
    this.setupBackButton();
    StudyTabsComponent.init(currentTab);
    
    // Listen for tab changes
    document.addEventListener('tabChanged', (e) => {
      this.onTabChanged(e.detail.tab);
    });
    
    // Load initial tab content
    this.loadTabContent(currentTab);
    
    // Save to recently viewed
    this.saveToRecentlyViewed();
  },
  
  /**
   * Load branch data
   */
  async loadBranchData() {
    try {
      const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.branches);
      this.branchData = data.branches.find(b => b.id === this.branchId);
    } catch (error) {
      console.error('Error loading branch data:', error);
    }
  },
  
  /**
   * Load subject data
   */
  async loadSubjectData() {
    try {
      const dataPath = CONFIG.DATA_PATHS.subjects[this.branchId];
      const data = await Utils.fetchJSON(dataPath);
      
      // Find subject in semester
      const semesterData = data.semesters.find(s => s.number === this.semester);
      this.subjectData = semesterData?.subjects.find(s => s.id === this.subjectId);
      
    } catch (error) {
      console.error('Error loading subject data:', error);
    }
  },
  
  /**
   * Load study material data
   */
  async loadMaterialData() {
    try {
      const fileName = `${this.branchId}-sem${this.semester}-${this.subjectId}.json`;
      const dataPath = CONFIG.DATA_PATHS.studyMaterial + fileName;
      
      this.materialData = await Utils.fetchJSON(dataPath);
      
    } catch (error) {
      console.error('Error loading material data:', error);
      this.materialData = null;
    }
  },
  
  /**
   * Update breadcrumb
   */
  updateBreadcrumb() {
    const branchLink = document.getElementById('breadcrumbBranch');
    const subjectSpan = document.getElementById('breadcrumbSubject');
    
    if (branchLink && this.branchData) {
      branchLink.textContent = this.branchData.name;
      branchLink.href = `branch-subjects.html?branch=${this.branchId}&semester=${this.semester}`;
    }
    
    if (subjectSpan && this.subjectData) {
      subjectSpan.textContent = this.subjectData.name;
    }
  },
  
  /**
   * Update page header
   */
  updatePageHeader() {
    const titleElement = document.getElementById('studyMaterialTitle');
    const subtitleElement = document.getElementById('studyMaterialSubtitle');
    
    if (titleElement && this.subjectData) {
      titleElement.textContent = this.subjectData.name;
    }
    
    if (subtitleElement) {
      subtitleElement.textContent = 'Access Subject-wise learning material — simple, fast, and organized.';
    }
  },
  
  /**
   * Setup back button
   */
  setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.href = `branch-subjects.html?branch=${this.branchId}&semester=${this.semester}`;
    }
  },
  
  /**
   * Handle tab change
   * @param {string} tab - New tab name
   */
  onTabChanged(tab) {
    // Save preference
    StorageManager.saveSelectedTab(this.subjectId, tab);
    
    // Load content
    this.loadTabContent(tab);
  },
  
  /**
   * Load content for active tab
   * @param {string} tab - Tab name
   */
  loadTabContent(tab) {
    switch (tab) {
      case 'notes':
        this.loadNotes();
        break;
      case 'practicals':
        this.loadPracticals();
        break;
      case 'videos':
        this.loadVideos();
        break;
      case 'pyqs':
        this.loadPYQs();
        break;
    }
  },
  
  /**
   * Load and render notes
   */
  loadNotes() {
    const listContainer = document.getElementById('unitsList');
    const emptyState = document.getElementById('notesEmpty');
    
    if (!this.materialData || !this.materialData.notes || this.materialData.notes.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    this.renderUnits(this.materialData.notes, listContainer);
  },
  
  /**
   * Render units/notes
   * @param {Array} units - Units data
   * @param {HTMLElement} container - Container element
   */
  renderUnits(units, container) {
    container.innerHTML = '';
    
    units.forEach((unit, index) => {
      const unitElement = document.createElement('div');
      unitElement.className = 'unit-item';
      
      unitElement.innerHTML = `
        <div class="unit-item-header">
          <div class="unit-item-title-wrapper">
            <span class="unit-item-number">${index + 1}</span>
            <h3 class="unit-item-title">${unit.title}</h3>
          </div>
          <div class="unit-item-actions">
            <button class="btn btn-primary btn-sm" onclick="StudyMaterialPage.openPDF('${unit.pdfUrl || '#'}')">
              Open
            </button>
            <button class="btn btn-outline btn-sm" onclick="StudyMaterialPage.downloadPDF('${unit.pdfUrl || '#'}', '${unit.title}')">
              Download
            </button>
          </div>
        </div>
        ${unit.summary ? `
          <p class="unit-item-summary">${unit.summary}</p>
        ` : ''}
      `;
      
      container.appendChild(unitElement);
    });
  },
  
  /**
   * Load and render practicals
   */
  loadPracticals() {
    const listContainer = document.getElementById('practicalsList');
    const emptyState = document.getElementById('practicalsEmpty');
    
    if (!this.materialData || !this.materialData.practicals || this.materialData.practicals.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    this.renderPracticals(this.materialData.practicals, listContainer);
  },
  
  /**
   * Render practicals
   * @param {Array} practicals - Practicals data
   * @param {HTMLElement} container - Container element
   */
  renderPracticals(practicals, container) {
    container.innerHTML = '';
    
    practicals.forEach((practical, index) => {
      const practicalElement = document.createElement('div');
      practicalElement.className = 'practical-item';
      
      // Virtual lab URL
      const virtualLabUrl = practical.virtualLabUrl || 
                           `${CONFIG.EXTERNAL_LINKS.virtualLab}${this.branchId}/${this.subjectId}/${practical.id}`;
      
      practicalElement.innerHTML = `
        <div class="practical-item-content" onclick="window.open('${virtualLabUrl}', '_blank')">
          <span class="practical-item-number">${index + 1}</span>
          <div>
            <h3 class="practical-item-title">${practical.title}</h3>
            ${practical.description ? `
              <p class="practical-item-description">${practical.description}</p>
            ` : ''}
          </div>
        </div>
        <div class="practical-item-actions">
          <button class="btn btn-primary btn-sm" onclick="StudyMaterialPage.openPDF('${practical.pdfUrl || '#'}')">
            Open
          </button>
          <button class="btn btn-outline btn-sm" onclick="StudyMaterialPage.downloadPDF('${practical.pdfUrl || '#'}', '${practical.title}')">
            Download
          </button>
        </div>
      `;
      
      container.appendChild(practicalElement);
    });
  },
  
  /**
   * Load and render videos
   */
  loadVideos() {
    const listContainer = document.getElementById('videosList');
    const emptyState = document.getElementById('videosEmpty');
    
    if (!this.materialData || !this.materialData.videos || this.materialData.videos.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    this.renderVideos(this.materialData.videos, listContainer);
  },
  
  /**
   * Render videos
   * @param {Array} videos - Videos data
   * @param {HTMLElement} container - Container element
   */
  renderVideos(videos, container) {
    container.innerHTML = '';
    
    videos.forEach(video => {
      const videoElement = document.createElement('a');
      videoElement.className = 'video-item';
      videoElement.href = video.url;
      videoElement.target = '_blank';
      videoElement.rel = 'noopener noreferrer';
      
      // Extract YouTube video ID
      const videoId = this.extractYouTubeId(video.url);
      const thumbnailUrl = videoId 
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : 'assets/images/video-placeholder.jpg';
      
      videoElement.innerHTML = `
        <div class="video-thumbnail">
          <img src="${thumbnailUrl}" alt="${video.title}" loading="lazy">
          <div class="video-play-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          ${video.duration ? `
            <span class="video-duration">${video.duration}</span>
          ` : ''}
        </div>
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-meta">
            ${video.views ? `
              <span class="video-views">${video.views} views</span>
            ` : ''}
            ${video.uploadDate ? `
              <span class="video-date">${Utils.formatDate(video.uploadDate)}</span>
            ` : ''}
          </div>
        </div>
      `;
      
      container.appendChild(videoElement);
    });
  },
  
  /**
   * Load and render PYQs
   */
  loadPYQs() {
    const listContainer = document.getElementById('pyqsList');
    const emptyState = document.getElementById('pyqsEmpty');
    
    if (!this.materialData || !this.materialData.pyqs || this.materialData.pyqs.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    this.renderPYQs(this.materialData.pyqs, listContainer);
  },
  
  /**
   * Render PYQs
   * @param {Array} pyqs - PYQs data
   * @param {HTMLElement} container - Container element
   */
  renderPYQs(pyqs, container) {
    container.innerHTML = '';
    
    // Sort by year (newest first)
    const sortedPyqs = [...pyqs].sort((a, b) => b.year - a.year);
    
    sortedPyqs.forEach(pyq => {
      const pyqElement = document.createElement('div');
      pyqElement.className = 'pyq-item';
      
      pyqElement.innerHTML = `
        <div class="pyq-item-header">
          <div class="pyq-item-info">
            <h3 class="pyq-item-year">${pyq.year}</h3>
            <p class="pyq-item-exam">${pyq.examType || 'Semester Exam'}</p>
          </div>
          <div class="pyq-item-actions">
            <button class="btn btn-primary btn-sm" onclick="StudyMaterialPage.openPDF('${pyq.pdfUrl || '#'}')">
              Open
            </button>
            <button class="btn btn-outline btn-sm" onclick="StudyMaterialPage.downloadPDF('${pyq.pdfUrl || '#'}', 'PYQ-${pyq.year}')">
              Download
            </button>
          </div>
        </div>
        <div class="pyq-item-meta">
          ${pyq.pages ? `
            <span class="pyq-item-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ${pyq.pages} pages
            </span>
          ` : ''}
          ${pyq.fileSize ? `
            <span class="pyq-item-meta-item">
              ${pyq.fileSize}
            </span>
          ` : ''}
          ${pyq.downloads ? `
            <span class="pyq-item-meta-item">
              ${pyq.downloads} downloads
            </span>
          ` : ''}
        </div>
      `;
      
      container.appendChild(pyqElement);
    });
  },
  
  /**
   * Extract YouTube video ID from URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID
   */
  extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },
  
  /**
   * Open PDF in new tab
   * @param {string} url - PDF URL
   */
  openPDF(url) {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Utils.showToast('PDF not available yet', 'info');
    }
  },
  
  /**
   * Download PDF
   * @param {string} url - PDF URL
   * @param {string} filename - File name
   */
  downloadPDF(url, filename) {
    if (url && url !== '#') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
    } else {
      Utils.showToast('PDF not available yet', 'info');
    }
  },
  
  /**
   * Save to recently viewed
   */
  saveToRecentlyViewed() {
    if (this.branchData && this.subjectData) {
      StorageManager.addToRecentlyViewed({
        branchId: this.branchId,
        branchName: this.branchData.name,
        semester: this.semester,
        subjectId: this.subjectId,
        subjectName: this.subjectData.name,
        subjectCode: this.subjectData.code
      });
    }
  }
};

// Auto-initialize on study material page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('study-material.html')) {
      StudyMaterialPage.init();
    }
  });
} else {
  if (window.location.pathname.endsWith('study-material.html')) {
    StudyMaterialPage.init();
  }
}