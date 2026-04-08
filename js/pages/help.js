/* ============================================
   DIPLOMA NOTES - HELP PAGE LOGIC
   FAQ accordion functionality
   ============================================ */

const HelpPage = {
  
  /**
   * Initialize help page
   */
  init() {
    this.setupFAQAccordion();
  },
  
  /**
   * Setup FAQ accordion
   */
  setupFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
          faqItem.classList.add('active');
        }
      });
    });
  }
};

// Auto-initialize on help page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('help.html')) {
      HelpPage.init();
    }
  });
} else {
  if (window.location.pathname.endsWith('help.html')) {
    HelpPage.init();
  }
}