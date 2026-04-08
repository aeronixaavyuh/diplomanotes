    // Updates Page Logic
    const UpdatesPage = {
      allUpdates: [],
      currentFilter: 'all',
      
      async init() {
        await this.loadUpdates();
        this.setupFilters();
      },
      
      async loadUpdates() {
        try {
          const data = await Utils.fetchJSON(CONFIG.DATA_PATHS.updates);
          if (!data || !data.updates) throw new Error('Invalid data');
          
          // Sort by date (newest first)
          this.allUpdates = data.updates.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          
          this.renderUpdates();
        } catch (error) {
          console.error('Error loading updates:', error);
          document.getElementById('updatesContainer').innerHTML = `
            <div class="content-empty">
              <div class="content-empty-icon">📢</div>
              <h3 class="content-empty-title">Failed to load updates</h3>
              <p class="content-empty-description">Please try again later.</p>
            </div>
          `;
        }
      },
      
      setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentFilter = btn.getAttribute('data-filter');
            this.renderUpdates();
          });
        });
      },
      
      renderUpdates() {
        const container = document.getElementById('updatesContainer');
        
        // Filter updates
        const filtered = this.currentFilter === 'all' 
          ? this.allUpdates 
          : this.allUpdates.filter(u => u.type === this.currentFilter);
        
        if (filtered.length === 0) {
          container.innerHTML = `
            <div class="content-empty">
              <div class="content-empty-icon">📢</div>
              <h3 class="content-empty-title">No updates found</h3>
              <p class="content-empty-description">Check back later for new updates.</p>
            </div>
          `;
          return;
        }
        
        container.innerHTML = '';
        
        filtered.forEach(update => {
          const item = this.createUpdateItem(update);
          container.appendChild(item);
        });
      },
      
      createUpdateItem(update) {
        const item = document.createElement('div');
        item.className = 'update-item';
        
        const tagClass = update.type === 'exam' ? 'tag-exam' : 
                        update.type === 'job' ? 'tag-job' : 'tag-result';
        
        const borderColor = update.type === 'exam' ? '#2563EB' : 
                           update.type === 'job' ? '#10B981' : '#F59E0B';
        
        item.style.borderLeftColor = borderColor;
        
        if (update.url && update.url !== '#') {
          item.style.cursor = 'pointer';
          item.addEventListener('click', () => {
            window.open(update.url, '_blank', 'noopener,noreferrer');
          });
        }
        
        item.innerHTML = `
          <div class="update-item-header">
            <div style="flex: 1;">
              <span class="tag ${tagClass}">${update.type}</span>
              <h2 class="update-item-title">${update.title}</h2>
            </div>
          </div>
          ${update.description ? `
            <p class="update-item-description">${update.description}</p>
          ` : ''}
          <div class="update-item-meta">
            <span>📅 ${Utils.formatDate(update.date)}</span>
            ${update.url && update.url !== '#' ? '<span>🔗 Click to view details</span>' : ''}
          </div>
        `;
        
        return item;
      }
    };
    
    // Initialize
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => UpdatesPage.init());
    } else {
      UpdatesPage.init();
    }
