/* ============================================
   DIPLOMA NOTES - PRESENTATIONS PAGE
   ONE responsive grid of cards used on every
   device - no click-through navigation anywhere.
   Every card previews inline. Iframes are
   lazy-loaded via IntersectionObserver so a long
   list doesn't load everything at once.

   Uses Google's / Office's EMBED-only endpoints
   (not full-page view/edit links) so mobile
   browsers don't try to hand off to a native app.
   ============================================ */

const PresentationsPage = {

  state: {
    branch: null,
    semester: null,
    subject: null,
    allPresentations: []
  },

  observer: null,

  /**
   * Same flat naming convention already used for notes/practicals/pyqs:
   *   data/study-material/electrical-sem3-electric-machine-1.json
   * The Industry Training subject's file just has a
   * "presentations" array instead of notes/practicals/pyqs.
   */
  getDataUrl(branch, semester, subject) {
    return `data/study-material/${branch}-sem${semester}-${subject}.json`;
  },

  getAbsoluteFileUrl(relativePath) {
    return new URL(relativePath, window.location.href).toString();
  },

  isGoogleSlidesUrl(url) {
    return typeof url === 'string' && url.includes('docs.google.com/presentation');
  },

  isGoogleDriveFileUrl(url) {
    return typeof url === 'string' && url.includes('drive.google.com');
  },

  extractDriveFileId(url) {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  /**
   * EMBED-only URL for iframes. These endpoints exist specifically
   * to be framed and do not trigger the "open in app?" prompt that
   * Android/Chrome shows for full-page docs.google.com or
   * drive.google.com links.
   */
  resolveEmbedUrl(fileUrl) {
    if (this.isGoogleSlidesUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`;
      return fileUrl;
    }
    if (this.isGoogleDriveFileUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
      return fileUrl;
    }
    // Regular repo-hosted pptx - Office Online's embed endpoint.
    // NOTE: only works once the file is on a public https URL
    // (e.g. after deploying to GitHub Pages) - it cannot reach
    // localhost, so preview will always fail during local testing.
    const absoluteUrl = this.getAbsoluteFileUrl(fileUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  },

  /**
   * Full-page link - used only as the "Open it directly instead"
   * fallback below each preview, opens in a new tab.
   */
  resolveExternalLink(fileUrl) {
    if (this.isGoogleSlidesUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`;
      return fileUrl;
    }
    if (this.isGoogleDriveFileUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://drive.google.com/file/d/${id}/view`;
      return fileUrl;
    }
    const absoluteUrl = this.getAbsoluteFileUrl(fileUrl);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  },

  /**
   * Download link - always tries to hand back a real, direct
   * downloadable file, regardless of source. No confirmation
   * dialog, no restriction - clicking it downloads immediately.
   */
  resolveDownloadUrl(fileUrl) {
    if (this.isGoogleSlidesUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://docs.google.com/presentation/d/${id}/export/pptx`;
      return fileUrl;
    }
    if (this.isGoogleDriveFileUrl(fileUrl)) {
      const id = this.extractDriveFileId(fileUrl);
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
      return fileUrl;
    }
    return fileUrl;
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

    // Reset the observer for the new set of cards
    if (this.observer) {
      this.observer.disconnect();
    }

    if (!presentations || presentations.length === 0) {
      grid.innerHTML = `<div class="presentations-no-results"><p>No presentations match your search.</p></div>`;
      return;
    }

    grid.innerHTML = presentations.map(p => this.renderCard(p)).join('');

    // Lazy-load each card's iframe only once it actually scrolls
    // into view, so a long grid doesn't load every embed at once.
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const frame = entry.target.querySelector('.presentation-card-embed-frame');
        if (frame && !frame.src) {
          frame.addEventListener('load', () => frame.classList.add('is-loaded'), { once: true });
          frame.src = frame.dataset.src;
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '250px 0px' }); // start loading a little before it's fully visible

    grid.querySelectorAll('.presentation-card-embed').forEach(el => {
      this.observer.observe(el);
    });
  },

  renderCard(p) {
    const downloadUrl = this.resolveDownloadUrl(p.fileUrl);
    const embedUrl = this.resolveEmbedUrl(p.fileUrl);
    const externalUrl = this.resolveExternalLink(p.fileUrl);
    const is4x3 = p.aspectRatio === '4:3';
    const metaParts = [
      p.studentName || 'Unknown Student',
      p.rollNumber,
      p.uploadDate ? new Date(p.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null
    ].filter(Boolean);

    return `
      <div class="presentation-card">
        <div class="presentation-card-header">
          <h3 class="presentation-card-title">${p.title}</h3>
          <a href="${downloadUrl}" class="btn btn-primary presentation-card-download" target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </div>
        <p class="presentation-card-meta">${metaParts.join(' · ')}</p>

        <div class="presentation-card-embed ${is4x3 ? 'is-4-3' : ''}">
          <div class="presentation-card-embed-loading">
            <div class="subjects-loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
          <iframe
            class="presentation-card-embed-frame"
            data-src="${embedUrl}"
            title="${p.title} preview"
            allowfullscreen
          ></iframe>
        </div>

        <p class="presentation-card-note">
          Preview not loading?
          <a href="${externalUrl}" target="_blank" rel="noopener noreferrer">Open it directly instead</a>
        </p>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PresentationsPage.init();
});