/* ============================================
   DIPLOMA NOTES - PRESENTATIONS PAGE
   Loads and renders student PPTX presentations
   for subjects like "Industry Training"
   ============================================ */

const PresentationsPage = {

  state: {
    branch: null,
    semester: null,
    subject: null,
    allPresentations: []
  },

  /**
   * Build the path to the JSON file that stores presentation
   * metadata for this branch/semester/subject.
   *
   * Reuses the exact same data/study-material/ folder and flat
   * naming convention already used for notes/practicals/pyqs:
   *   data/study-material/electrical-sem3-electric-machine-1.json
   * The Industry Training subject's file just has a
   * "presentations" array instead of notes/practicals/pyqs:
   *   data/study-material/electrical-sem2-industry-training.json
   */
  getDataUrl(branch, semester, subject) {
    return `data/study-material/${branch}-sem${semester}-${subject}.json`;
  },

  /**
   * Build the public URL for a pptx file so it can be opened
   * in Office Online's viewer. Must be a publicly reachable
   * https URL (works fine on GitHub Pages).
   */
  getAbsoluteFileUrl(relativePath) {
    return new URL(relativePath, window.location.href).toString();
  },

  /**
   * Detects whether a fileUrl is a Google SLIDES presentation
   * (created/edited directly in Google Slides), as opposed to a
   * pptx FILE uploaded to Drive. These need different URLs:
   *   Slides:      https://docs.google.com/presentation/d/ID/edit
   *   Drive file:  https://drive.google.com/file/d/ID/view
   */
  isGoogleSlidesUrl(url) {
    return typeof url === 'string' && url.includes('docs.google.com/presentation');
  },

  /**
   * Detects whether a fileUrl points to a file uploaded to
   * Google Drive (a real .pptx sitting in Drive, not a native
   * Google Slides document).
   */
  isGoogleDriveFileUrl(url) {
    return typeof url === 'string' && url.includes('drive.google.com');
  },

  /**
   * Pulls the ID out of a Google URL. Works for both shapes since
   * they share the same /d/ID/ segment:
   *   docs.google.com/presentation/d/ID/edit
   *   drive.google.com/file/d/ID/view
   */
  extractDriveFileId(url) {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,   // /presentation/d/ID or /file/d/ID
      /[?&]id=([a-zA-Z0-9_-]+)/ // ?id=ID or &id=ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  /**
   * Given a presentation's stored fileUrl, returns the correct
   * { previewUrl, downloadUrl } pair. Handles three cases:
   *   1. Google Slides document (docs.google.com/presentation/...)
   *   2. A pptx file uploaded to Google Drive (drive.google.com/file/...)
   *   3. A regular repo-hosted pptx (opened via Office Online)
   * Both links always open in a new tab - no iframe embedding.
   */
  resolveFileLinks(fileUrl) {
    // Case 1: native Google Slides document
    if (this.isGoogleSlidesUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (!id) return { previewUrl: fileUrl, downloadUrl: fileUrl };

      return {
        // View-only editor page - this is the correct "preview" for Slides
        previewUrl: `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`,
        // Ask Google to export the Slides doc as a real .pptx file
        downloadUrl: `https://docs.google.com/presentation/d/${id}/export/pptx`
      };
    }

    // Case 2: an actual .pptx file uploaded to Drive
    if (this.isGoogleDriveFileUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (!id) return { previewUrl: fileUrl, downloadUrl: fileUrl };

      return {
        previewUrl: `https://drive.google.com/file/d/${id}/view`,
        // Large files may show Drive's virus-scan interstitial first -
        // that's a Drive limitation, not a bug here.
        downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`
      };
    }

    // Case 3: regular repo-hosted pptx - use Office Online's viewer page.
    // NOTE: this only works once the file is on a public https URL
    // (e.g. after deploying to GitHub Pages) - it cannot reach
    // localhost, so preview will always fail during local testing.
    const absoluteUrl = this.getAbsoluteFileUrl(fileUrl);
    return {
      previewUrl: `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`,
      downloadUrl: fileUrl
    };
  },

  async init() {
    const params = Router.getParams();
    this.state.branch = params.branch;
    this.state.semester = params.semester;
    this.state.subject = params.subject;

    this.setupBackButton();
    this.setupBreadcrumb();
    this.setupSearch();

    await this.loadPresentations();
  },

  setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (!backButton) return;
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      Router.toBranchSubjects(this.state.branch, this.state.semester);
    });
  },

  setupBreadcrumb() {
    const branchLink = document.getElementById('breadcrumbBranch');
    if (branchLink) {
      branchLink.addEventListener('click', (e) => {
        e.preventDefault();
        Router.toBranchSubjects(this.state.branch, this.state.semester);
      });
    }
  },

  setupSearch() {
    const input = document.getElementById('presentationsSearchInput');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const filtered = !query
        ? this.state.allPresentations
        : this.state.allPresentations.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.studentName || '').toLowerCase().includes(query)
          );
      this.renderGrid(filtered);
    });
  },

  async loadPresentations() {
    const grid = document.getElementById('presentationsGrid');
    const emptyState = document.getElementById('presentationsEmpty');

    try {
      const url = this.getDataUrl(this.state.branch, this.state.semester, this.state.subject);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load presentations (${response.status})`);
      }

      const data = await response.json();
      this.state.allPresentations = data.presentations || [];

      if (data.subjectName) {
        document.getElementById('presentationsTitle').textContent = `${data.subjectName} Presentations`;
      }
      if (data.branchName) {
        document.getElementById('breadcrumbBranch').textContent = data.branchName;
      }

      if (this.state.allPresentations.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';
      this.renderGrid(this.state.allPresentations);

    } catch (err) {
      console.error('PresentationsPage: failed to load data', err);
      grid.innerHTML = '';
      emptyState.style.display = 'block';
    }
  },

  renderGrid(presentations) {
    const grid = document.getElementById('presentationsGrid');
    if (!grid) return;

    if (!presentations || presentations.length === 0) {
      grid.innerHTML = `
        <div class="presentations-no-results">
          <p>No presentations match your search.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = presentations.map(p => this.renderCard(p)).join('');
  },

  renderCard(p) {
    const uploadDate = p.uploadDate
      ? new Date(p.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    const { previewUrl, downloadUrl } = this.resolveFileLinks(p.fileUrl);

    return `
      <div class="presentation-card">
        <div class="presentation-card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 4h7l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 4v5h5" />
          </svg>
          <span class="presentation-card-badge">PPTX</span>
        </div>

        <div class="presentation-card-body">
          <h3 class="presentation-card-title">${p.title}</h3>
          <p class="presentation-card-student">${p.studentName || 'Unknown Student'}${p.rollNumber ? ' · ' + p.rollNumber : ''}</p>

          <div class="presentation-card-meta">
            ${uploadDate ? `<span>${uploadDate}</span>` : ''}
            ${p.fileSize ? `<span>${p.fileSize}</span>` : ''}
            ${p.slides ? `<span>${p.slides} slides</span>` : ''}
          </div>
        </div>

        <div class="presentation-card-actions">
          <a href="${previewUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline presentation-card-btn">
            Preview
          </a>
          <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary presentation-card-btn">
            Download
          </a>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PresentationsPage.init();
});