/* ============================================
   DIPLOMA NOTES - PRESENTATIONS PAGE

   MOBILE: renders every presentation as its own
   card with an inline preview - no click-through
   navigation. Iframes are lazy-loaded via
   IntersectionObserver so scrolling past a long
   list doesn't load everything at once.

   DESKTOP: master-detail split view - compact list
   on the left, one big preview panel on the right
   that updates when a list item is clicked.

   Both use Google's / Office's EMBED-only endpoints
   (not full-page view/edit links) so mobile browsers
   don't try to hand off to a native app.
   ============================================ */

const PresentationsPage = {

  state: {
    branch: null,
    semester: null,
    subject: null,
    allPresentations: [],
    selectedId: null
  },

  mobileObserver: null,

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
      this.renderList(filtered);
      this.renderMobileList(filtered);
    });
  },

  async loadPresentations() {
    const list = document.getElementById('presentationsList');
    const mobileList = document.getElementById('presentationsMobileList');
    const emptyState = document.getElementById('presentationsEmpty');
    const layout = document.getElementById('presentationsLayout');

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
        layout.style.display = 'none';
        mobileList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';
      this.renderList(this.state.allPresentations);
      this.renderMobileList(this.state.allPresentations);

      // Desktop's right-hand panel needs something selected by
      // default since both panes are visible together. This has
      // no effect on mobile (that layout isn't used there at all).
      this.selectPresentation(this.state.allPresentations[0].id);

    } catch (err) {
      console.error('PresentationsPage: failed to load data', err);
      list.innerHTML = '';
      mobileList.innerHTML = '';
      emptyState.style.display = 'block';
      layout.style.display = 'none';
    }
  },

  /* =========================================================
     DESKTOP: compact list + big detail panel
     ========================================================= */

  renderList(presentations) {
    const list = document.getElementById('presentationsList');
    if (!list) return;

    if (!presentations || presentations.length === 0) {
      list.innerHTML = `<div class="presentations-no-results"><p>No presentations match your search.</p></div>`;
      return;
    }

    list.innerHTML = presentations.map(p => this.renderListItem(p)).join('');

    list.querySelectorAll('[data-select-id]').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-select-id');
        this.selectPresentation(id);
      });
    });

    // Download icon inside a list item should download directly -
    // it must not also trigger selecting that item.
    list.querySelectorAll('[data-download-id]').forEach(btn => {
      btn.addEventListener('click', (e) => e.stopPropagation());
    });
  },

  renderListItem(p) {
    const isActive = p.id === this.state.selectedId;
    const downloadUrl = this.resolveDownloadUrl(p.fileUrl);

    return `
      <div class="presentation-list-item ${isActive ? 'is-active' : ''}" data-select-id="${p.id}">
        <div class="presentation-list-item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 4h7l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 4v5h5" />
          </svg>
        </div>
        <div class="presentation-list-item-body">
          <h3 class="presentation-list-item-title">${p.title}</h3>
          <p class="presentation-list-item-meta">${p.studentName || 'Unknown Student'}${p.rollNumber ? ' · ' + p.rollNumber : ''}</p>
        </div>
        <a href="${downloadUrl}" class="presentation-list-item-download" data-download-id="${p.id}" target="_blank" rel="noopener noreferrer" aria-label="Download">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
        </a>
      </div>
    `;
  },

  selectPresentation(id) {
    const presentation = this.state.allPresentations.find(p => p.id === id);
    if (!presentation) return;

    this.state.selectedId = id;

    document.querySelectorAll('.presentation-list-item').forEach(el => {
      el.classList.toggle('is-active', el.getAttribute('data-select-id') === id);
    });

    this.renderViewer(presentation);
  },

  renderViewer(p) {
    const placeholder = document.getElementById('viewerPlaceholder');
    const content = document.getElementById('viewerContent');
    const titleEl = document.getElementById('viewerTitle');
    const subtitleEl = document.getElementById('viewerSubtitle');
    const downloadBtn = document.getElementById('viewerDownloadBtn');
    const embedBox = document.getElementById('viewerEmbed');
    const loading = document.getElementById('viewerEmbedLoading');
    const frame = document.getElementById('viewerEmbedFrame');
    const externalLink = document.getElementById('viewerExternalLink');

    placeholder.style.display = 'none';
    content.style.display = 'block';

    titleEl.textContent = p.title;
    subtitleEl.textContent = `${p.studentName || 'Unknown Student'}${p.rollNumber ? ' · ' + p.rollNumber : ''}${p.uploadDate ? ' · ' + new Date(p.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`;
    downloadBtn.href = this.resolveDownloadUrl(p.fileUrl);
    externalLink.href = this.resolveExternalLink(p.fileUrl);

    // Avoid black letterboxing bars: match the embed box's aspect
    // ratio to this presentation's real slide ratio. Add
    // "aspectRatio": "4:3" to a presentation's JSON entry for
    // older-style 4:3 decks - defaults to 16:9 otherwise.
    embedBox.classList.toggle('is-4-3', p.aspectRatio === '4:3');

    loading.style.display = 'flex';
    frame.style.opacity = '0';

    frame.onload = () => {
      loading.style.display = 'none';
      frame.style.opacity = '1';
    };
    frame.src = this.resolveEmbedUrl(p.fileUrl);
  },

  /* =========================================================
     MOBILE: stacked cards, each with its own lazy-loaded preview
     ========================================================= */

  renderMobileList(presentations) {
    const container = document.getElementById('presentationsMobileList');
    if (!container) return;

    // Reset the observer for the new set of cards
    if (this.mobileObserver) {
      this.mobileObserver.disconnect();
    }

    if (!presentations || presentations.length === 0) {
      container.innerHTML = `<div class="presentations-no-results"><p>No presentations match your search.</p></div>`;
      return;
    }

    container.innerHTML = presentations.map(p => this.renderMobileCard(p)).join('');

    // Lazy-load each card's iframe only once it actually scrolls
    // into view, so a long list doesn't load 10+ embeds at once.
    this.mobileObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const frame = entry.target.querySelector('.mobile-card-embed-frame');
        if (frame && !frame.src) {
          frame.addEventListener('load', () => frame.classList.add('is-loaded'), { once: true });
          frame.src = frame.dataset.src;
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '200px 0px' }); // start loading a little before it's fully visible

    container.querySelectorAll('.mobile-card-embed').forEach(el => {
      this.mobileObserver.observe(el);
    });
  },

  renderMobileCard(p) {
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
      <div class="mobile-presentation-card">
        <div class="mobile-card-header">
          <h3 class="mobile-card-title">${p.title}</h3>
          <a href="${downloadUrl}" class="btn btn-primary mobile-card-download" target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </div>
        <p class="mobile-card-meta">${metaParts.join(' · ')}</p>

        <div class="mobile-card-embed ${is4x3 ? 'is-4-3' : ''}">
          <div class="mobile-card-embed-loading">
            <div class="subjects-loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
          <iframe
            class="mobile-card-embed-frame"
            data-src="${embedUrl}"
            title="${p.title} preview"
            allowfullscreen
          ></iframe>
        </div>

        <p class="mobile-card-note">
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