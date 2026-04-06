/* ============================================
   DIPLOMA NOTES - NAVBAR COMPONENT
   Mobile menu toggle and navigation
   ============================================ */

const NavbarComponent = {
  
  /**
   * Initialize navbar
   */
  init() {
    console.log('Navbar initializing...');
    this.setupMobileToggle();
    this.setupActiveLinks();
    this.fixStickyNavbar(); // NEW: Fix sticky navbar
    console.log('Navbar initialized');
  },
  
  /**
   * Setup mobile menu toggle
   */
  setupMobileToggle() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    
    console.log('Setting up mobile toggle. Toggle:', toggle, 'Menu:', menu);
    
    if (!toggle || !menu) {
      console.error('Mobile toggle or menu not found!');
      return;
    }
    
    // Remove any existing event listeners by cloning
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
    
    // Add click handler to new toggle
    newToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Hamburger clicked!');
      
      const isActive = menu.classList.contains('active');
      
      if (isActive) {
        menu.classList.remove('active');
        newToggle.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Menu closed');
      } else {
        menu.classList.add('active');
        newToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Menu opened');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const navbar = document.querySelector('.navbar');
      if (!navbar.contains(e.target) && menu.classList.contains('active')) {
        menu.classList.remove('active');
        newToggle.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Menu closed (outside click)');
      }
    });
    
    // Close menu when clicking a link
    const navLinks = menu.querySelectorAll('.navbar-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        newToggle.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Menu closed (link clicked)');
      });
    });
  },
  
  /**
   * Setup active link highlighting
   */
  setupActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    const navLinks = document.querySelectorAll('.navbar-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Remove active class first
      link.classList.remove('active');
      
      // Handle hash links (like #branches, #updates)
      if (href && href.startsWith('#')) {
        if (currentHash === href) {
          link.classList.add('active');
        }
        return;
      }
      
      // Handle page links
      if (href && href.includes(currentPage)) {
        link.classList.add('active');
      }
      
      // Special case for home page
      if (currentPage === '' || currentPage === 'index.html') {
        if (href === 'index.html' || href === '/') {
          link.classList.add('active');
        }
      }
    });
  },
  
  /**
   * Fix sticky navbar - ensure it always stays visible
   */
  fixStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) {
      console.error('Navbar not found for sticky fix!');
      return;
    }
    
    // Force sticky positioning
    navbar.style.position = 'sticky';
    navbar.style.top = '0';
    navbar.style.zIndex = '1020';
    navbar.style.transition = 'none'; // Remove any transitions that might hide it
    
    // Disable scroll behavior that hides navbar
    window.removeEventListener('scroll', this.handleScroll);
    
    console.log('Sticky navbar fixed - will always remain visible');
  }
};

// Auto-initialize when DOM is ready
console.log('navbar.js loaded');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing navbar...');
    NavbarComponent.init();
  });
} else {
  console.log('DOM already loaded, initializing navbar...');
  NavbarComponent.init();
}