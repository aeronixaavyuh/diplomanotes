/* ============================================
   DIPLOMA NOTES - HOME PAGE LOGIC
   Handles homepage functionality
   ============================================ */

const HomePage = {
  
  /**
   * Initialize home page
   */
  async init() {
    console.log('HomePage initializing...');
    
    await this.loadBranches();
    await this.loadUpdates();
    await this.loadContributors();
    this.setupSmoothScroll();
    
    console.log('HomePage initialized successfully');
  },
  
  /**
   * Load and display branches
   */
  async loadBranches() {
    const containerId = 'branchesGrid';
    console.log('Loading branches...');
    
    BranchCardComponent.showLoading(containerId);
    
    try {
      const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.branches);
      console.log('Branches data loaded:', data);
      
      if (!data || !data.branches) {
        throw new Error('Invalid data format');
      }
      
      BranchCardComponent.render(data.branches, containerId);
      console.log('Branches rendered successfully');
      
    } catch (error) {
      console.error('Error loading branches:', error);
      BranchCardComponent.showError(containerId);
    }
  },
  
  /**
   * Load and display latest updates
   */
  async loadUpdates() {
    const containerId = 'updatesList';
    UpdateCardComponent.showLoading(containerId);
    
    try {
      const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.updates);
      
      if (!data || !data.updates) {
        throw new Error('Invalid data format');
      }
      
      // Sort by date (newest first)
      const sortedUpdates = data.updates.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Show only top 3 on homepage
      UpdateCardComponent.render(sortedUpdates, containerId, 3);
      
    } catch (error) {
      console.error('Error loading updates:', error);
      UpdateCardComponent.showEmpty(containerId);
    }
  },
  
  /**
   * Load and display contributors
   */
  async loadContributors() {
    const containerId = 'contributorsGrid';
    
    try {
      const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.contributors);
      
      if (!data || !data.contributors) {
        throw new Error('Invalid data format');
      }
      
      // Filter visible contributors
      const visibleContributors = data.contributors.filter(c => c.visible !== false);
      
      this.renderContributors(visibleContributors, containerId);
      
    } catch (error) {
      console.error('Error loading contributors:', error);
      // Don't show error, just hide section
      const section = document.getElementById('contributors');
      if (section) section.style.display = 'none';
    }
  },
  
  /**
   * Render contributors
   * @param {Array} contributors - Contributors data
   * @param {string} containerId - Container ID
   */
 /**
 * Render contributors (with marquee)
 */
async renderContributors() {
  try {
    const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.contributors);
    
    if (!data || !data.contributors) {
      return;
    }
    
    // Filter visible contributors
    const visibleContributors = data.contributors.filter(c => c.visible !== false);
    
    if (visibleContributors.length === 0) {
      return;
    }
    
    const marqueeContainer = document.getElementById('contributorsMarquee');
    if (!marqueeContainer) return;
    
    // Generate cards HTML
    const cardsHTML = visibleContributors.map(contributor => 
      this.createContributorCard(contributor)
    ).join('');
    
    // Duplicate cards for seamless loop
    marqueeContainer.innerHTML = cardsHTML + cardsHTML;
    
  } catch (error) {
    console.error('Error loading contributors:', error);
  }
},

/**
 * Create contributor card
 */
createContributorCard(contributor) {
  return `
    <div class="contributor-card">
      <div class="contributor-avatar">
        <img src="${contributor.avatar || 'assets/images/contributors/default.jpg'}" 
             alt="${contributor.name}" 
             loading="lazy">
      </div>
      <div class="contributor-info">
        <h3 class="contributor-name">${Utils.sanitizeHTML(contributor.name)}</h3>
        <p class="contributor-branch">${Utils.sanitizeHTML(contributor.branch)}</p>
        <p class="contributor-contribution">${Utils.sanitizeHTML(contributor.contribution)}</p>
        ${contributor.linkedin || contributor.github || contributor.twitter ? `
          <div class="contributor-social">
            ${contributor.linkedin ? `
              <a href="${contributor.linkedin}" target="_blank" rel="noopener noreferrer" 
                 class="contributor-social-link" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            ` : ''}
            ${contributor.github ? `
              <a href="${contributor.github}" target="_blank" rel="noopener noreferrer" 
                 class="contributor-social-link" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
            ` : ''}
            ${contributor.twitter ? `
              <a href="${contributor.twitter}" target="_blank" rel="noopener noreferrer" 
                 class="contributor-social-link" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `;
},
  
  /**
   * Setup smooth scroll for anchor links
   */
  setupSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Skip if just "#"
        if (href === '#') return;
        
        e.preventDefault();
        Utils.scrollTo(href);
      });
    });
  }
};

// Auto-initialize on home page
console.log('home.js loaded, checking if we should initialize...');

function initHomePageIfNeeded() {
  const path = window.location.pathname;
  const isHomePage = path.endsWith('index.html') || 
                     path === '/' || 
                     path.endsWith('/');
  
  console.log('Current path:', path, 'Is home page:', isHomePage);
  
  if (isHomePage) {
    console.log('Initializing HomePage...');
    HomePage.init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePageIfNeeded);
} else {
  initHomePageIfNeeded();
}