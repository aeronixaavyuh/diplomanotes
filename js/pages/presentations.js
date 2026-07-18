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
   * Detects whether a fileUrl points to Google Drive.
   * Works with any of the common share-link formats:
   *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   *   https://drive.google.com/open?id=FILE_ID
   *   https://drive.google.com/uc?id=FILE_ID
   */
  isGoogleDriveUrl(url) {
    return typeof url === 'string' && url.includes('drive.google.com');
  },

  /**
   * Pulls the FILE_ID out of any common Google Drive URL shape.
   * Returns null if no id could be found.
   */
  extractDriveFileId(url) {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,   // /file/d/FILE_ID/view
      /[?&]id=([a-zA-Z0-9_-]+)/        // ?id=FILE_ID or &id=FILE_ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  /**
   * Given a presentation's stored fileUrl (repo path OR a Google
   * Drive share link), returns the correct { previewUrl, downloadUrl }
   * pair to actually use in the UI.
   */
  resolveFileLinks(fileUrl) {
    if (this.isGoogleDriveUrl(fileUrl)) {
      const fileId = this.extractDriveFileId(fileUrl);

      if (!fileId) {
        // Couldn't parse an id - fall back to the raw link
        return { previewUrl: fileUrl, downloadUrl: fileUrl, isDrive: true };
      }

      return {
        // Drive's own embeddable preview - works even while your
        // site is running on localhost, since Drive is already public.
        previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        // Direct download (large files may show Drive's virus-scan
        // interstitial first - that's a Drive limitation, not a bug here).
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        isDrive: true
      };
    }

    // Regular repo-hosted pptx - use Office Online's viewer
    const absoluteUrl = this.getAbsoluteFileUrl(fileUrl);
    return {
      previewUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`,
      downloadUrl: fileUrl,
      isDrive: false
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
    this.setupModal();

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

      // Update header text if the JSON provides a title/branch name
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

    // Wire up buttons after render
    grid.querySelectorAll('[data-preview-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preview-id');
        const presentation = presentations.find(p => p.id === id);
        if (presentation) this.openPreview(presentation);
      });
    });
  },

  renderCard(p) {
    const uploadDate = p.uploadDate
      ? new Date(p.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    const { downloadUrl } = this.resolveFileLinks(p.fileUrl);

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
          <button class="btn btn-outline presentation-card-btn" data-preview-id="${p.id}">
            Preview
          </button>
          <a href="${downloadUrl}" class="btn btn-primary presentation-card-btn" download>
            Download
          </a>
        </div>
      </div>
    `;
  },

  setupModal() {
    const modal = document.getElementById('presentationModal');
    const backdrop = document.getElementById('presentationModalBackdrop');
    const closeBtn = document.getElementById('presentationModalClose');

    const close = () => this.closePreview();

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  },

  openPreview(presentation) {
    const modal = document.getElementById('presentationModal');
    const title = document.getElementById('presentationModalTitle');
    const frame = document.getElementById('presentationModalFrame');
    const loading = document.getElementById('presentationModalLoading');
    const downloadLink = document.getElementById('presentationModalDownload');

    const { previewUrl, downloadUrl } = this.resolveFileLinks(presentation.fileUrl);

    title.textContent = presentation.title;
    downloadLink.href = downloadUrl;

    loading.style.display = 'flex';
    frame.style.display = 'none';

    frame.onload = () => {
      loading.style.display = 'none';
      frame.style.display = 'block';
    };
    frame.src = previewUrl;

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  },

  closePreview() {
    const modal = document.getElementById('presentationModal');
    const frame = document.getElementById('presentationModalFrame');

    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    frame.src = 'about:blank';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PresentationsPage.init();
});