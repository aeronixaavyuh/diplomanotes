/* ============================================
   DIPLOMA NOTES - CONTACT PAGE LOGIC
   Handles contact form submission
   ============================================ */

const ContactPage = {
  
  /**
   * Initialize contact page
   */
  init() {
    this.setupFormSubmission();
  },
  
  /**
   * Setup form submission handler
   */
  setupFormSubmission() {
    const form = document.getElementById('contactForm');
    
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
    const submitBtn = form.querySelector('.contact-submit-btn');
    const formData = new FormData(form);
    
    // Get form values
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Validate
    if (!this.validateForm(data)) {
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Sending...';
    
    // Simulate API call (replace with actual API call)
    await this.simulateSubmission(data);
    
    // Show success message
    this.showSuccess(form);
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = `
      Send Message
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
    if (!data.name || data.name.trim().length < 2) {
      Utils.showToast('Please enter a valid name', 'error');
      return false;
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      Utils.showToast('Please enter a valid email address', 'error');
      return false;
    }
    
    if (!data.subject) {
      Utils.showToast('Please select a subject', 'error');
      return false;
    }
    
    if (!data.message || data.message.trim().length < 10) {
      Utils.showToast('Please enter a message (at least 10 characters)', 'error');
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
    // In production, replace this with actual API call
    // Example:
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    
    console.log('Form submitted:', data);
    
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
    Utils.showToast('Message sent successfully!', 'success');
  }
};

// Auto-initialize on contact page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('contact.html')) {
      ContactPage.init();
    }
  });
} else {
  if (window.location.pathname.endsWith('contact.html')) {
    ContactPage.init();
  }
}