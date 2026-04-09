/* ============================================
   DIPLOMA NOTES - REPORT PAGE LOGIC
   Handles issue report submission
   ============================================ */

const ReportPage = {
  
  /**
   * Initialize report page
   */
  init() {
    this.setupFormSubmission();
  },
  
  /**
   * Setup form submission handler
   */
  setupFormSubmission() {
    const form = document.getElementById('reportForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });
  },
  
  /**
   * Handle form submission
   * @param {HTMLFormElement} form - Form element
   */
  async handleSubmit(form) {
    const submitBtn = form.querySelector('.report-submit-btn');
    const formData = new FormData(form);
    
    // Get form values
    const data = {
      issueType: formData.get('issueType'),
      branch: formData.get('branch'),
      subject: formData.get('subject'),
      pageUrl: formData.get('pageUrl'),
      issueTitle: formData.get('issueTitle'),
      issueDescription: formData.get('issueDescription'),
      expectedBehavior: formData.get('expectedBehavior'),
      reporterEmail: formData.get('reporterEmail')
    };
    
    // Validate
    if (!this.validateForm(data)) {
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Submitting...';
    
    // Simulate API call
    await this.simulateSubmission(data);
    
    // Show success message
    this.showSuccess(form);
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = `
      Submit Report
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    `;
    
    // Reset form
    form.reset();
  },
  
  /**
   * Validate form data
   * @param {Object} data - Form data
   * @returns {boolean} Is valid
   */
  validateForm(data) {
    if (!data.issueType) {
      Utils.showToast('Please select an issue type', 'error');
      return false;
    }
    
    if (!data.issueTitle || data.issueTitle.trim().length < 5) {
      Utils.showToast('Please provide a brief summary (at least 5 characters)', 'error');
      return false;
    }
    
    if (!data.issueDescription || data.issueDescription.trim().length < 10) {
      Utils.showToast('Please provide a detailed description (at least 10 characters)', 'error');
      return false;
    }
    
    if (data.reporterEmail && !this.isValidEmail(data.reporterEmail)) {
      Utils.showToast('Please enter a valid email address', 'error');
      return false;
    }
    
    return true;
  },
  
  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} Is valid
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Simulate form submission
   * @param {Object} data - Form data
   */
  async simulateSubmission(data) {
    console.log('Issue reported:', data);
    
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 1500));
  },
  
  /**
   * Show success message
   * @param {HTMLFormElement} form - Form element
   */
  showSuccess(form) {
    const successMessage = document.getElementById('successMessage');
    
    if (successMessage) {
      // Hide form
      form.style.display = 'none';
      
      // Show success message
      successMessage.style.display = 'block';
      
      // Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Reset after 5 seconds
      setTimeout(() => {
        form.style.display = 'flex';
        successMessage.style.display = 'none';
      }, 5000);
    }
    
    // Also show toast
    Utils.showToast('Issue reported successfully!', 'success');
  }
};

// Auto-initialize on report page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('report.html')) {
      ReportPage.init();
    }
  });
} else {
  if (window.location.pathname.endsWith('report.html')) {
    ReportPage.init();
  }
}