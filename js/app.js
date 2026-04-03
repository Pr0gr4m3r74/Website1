/* =============================================
   App – Hauptlogik (Navigation, Rendering)
   ============================================= */

const App = {
  EXCERPT_MIN_WORD_BOUNDARY_RATIO: 0.6,
  /** Initialisiert die Anwendung */
  init() {
    this.initNavigation();
    ThemeManager.init();
    this.renderDynamicContent();
  },

  /** Mobile Navigation Toggle */
  initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
      });

      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });
    }
  },

  /** Rendert dynamische Inhalte */
  renderDynamicContent() {
    this.renderGames();
    this.renderProjects();
    this.renderNews();
  },

  renderGames() {
    const gamesContainer = document.getElementById('gamesGrid');
    if (!gamesContainer) return;

    gamesContainer.innerHTML = SiteData.games.map(game => `
      <div class="game-tile">
        <div class="tile-icon">${game.icon}</div>
        <div class="tile-title">${this.escapeHtml(game.title)}${game.isNew ? ' <span class="badge badge-new">Neu</span>' : ''}</div>
        <div class="tile-desc">${this.escapeHtml(game.description)}</div>
        <div style="margin-bottom: var(--space-sm);">
          ${(game.tags || []).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
        </div>
        <a class="play-btn" href="${this.escapeHtml(game.url)}" aria-label="${this.escapeHtml(game.title)} öffnen">Spiel starten</a>
      </div>
    `).join('');
  },

  renderProjects() {
    const projectsContainer = document.getElementById('projectsGrid');
    if (!projectsContainer) return;

    const canManageProjects = typeof ProjectsAdmin !== 'undefined' && ProjectsAdmin.isAuthenticated();

    if (!SiteData.projects.length) {
      projectsContainer.innerHTML = '<article class="empty-state">Noch keine Projekte vorhanden.</article>';
      return;
    }

    projectsContainer.innerHTML = SiteData.projects.map(project => `
      <article class="project-card">
        <h3>${this.escapeHtml(project.title)}</h3>
        <div class="project-meta">Status: ${this.escapeHtml(project.status || 'Offen')} • Genre: ${this.escapeHtml(project.genre || 'Allgemein')}</div>
        <p>${this.escapeHtml(project.description)}</p>
        <div class="project-tags">
          ${(project.tags || []).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="project-card-footer">
          ${project.url ? `<a class="play-btn" href="${this.escapeHtml(project.url)}">Ansehen</a>` : '<span class="text-muted">Kein Link hinterlegt</span>'}
          ${canManageProjects ? `
            <div class="project-card-actions">
              <button type="button" class="btn btn-ghost" data-project-edit="${this.escapeHtml(project.id)}">Bearbeiten</button>
              <button type="button" class="btn-danger" data-project-delete="${this.escapeHtml(project.id)}">Löschen</button>
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');
  },

  renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    const newsDetail = document.getElementById('newsDetail');
    const title = document.getElementById('newsTitle');
    const description = document.getElementById('newsDescription');
    const selectedId = new URLSearchParams(window.location.search).get('id');

    if (newsDetail) {
      if (selectedId) {
        const item = SiteData.getAnnouncementById(selectedId);
        if (item) {
          if (title) title.textContent = item.title;
          if (description) description.textContent = 'Detailansicht der ausgewählten Ankündigung.';
          newsDetail.hidden = false;
          newsDetail.innerHTML = `
            <div class="news-detail-shell">
              <a href="news.html" class="btn btn-ghost back-link">← Zurück zur Übersicht</a>
              <article class="news-card news-card-detail">
                <div class="news-date">
                  ${item.pinned ? '📌 ' : ''}${this.formatDate(item.date)}
                  ${item.category ? ` • <span class="tag">${this.escapeHtml(item.category)}</span>` : ''}
                </div>
                <h3>${this.escapeHtml(item.title)}</h3>
                <p>${this.escapeHtml(item.content)}</p>
              </article>
            </div>
          `;
        } else {
          if (title) title.textContent = 'Ankündigung nicht gefunden';
          if (description) description.textContent = 'Die gewünschte Detailseite konnte nicht geladen werden.';
          newsDetail.hidden = false;
          newsDetail.innerHTML = `
            <div class="news-detail-shell">
              <a href="news.html" class="btn btn-ghost back-link">← Zurück zur Übersicht</a>
              <article class="empty-state">Diese Ankündigung existiert nicht mehr.</article>
            </div>
          `;
        }
      } else {
        newsDetail.hidden = true;
        newsDetail.innerHTML = '';
      }
    }

    if (!newsGrid) return;

    if (selectedId) {
      newsGrid.hidden = true;
      return;
    }

    const announcements = SiteData.getAnnouncements();
    const limit = newsGrid.dataset.limit ? parseInt(newsGrid.dataset.limit, 10) : announcements.length;
    newsGrid.hidden = false;
    const excerptLength = newsGrid.dataset.limit ? 110 : 180;
    newsGrid.innerHTML = announcements.slice(0, limit).map(news => `
      <article class="news-card">
        <div class="news-date">
          ${news.pinned ? '📌 ' : ''}${this.formatDate(news.date)}
          ${news.category ? ` • <span class="tag">${this.escapeHtml(news.category)}</span>` : ''}
        </div>
        <h3>${this.escapeHtml(news.title)}</h3>
        <p>${this.escapeHtml(this.getExcerpt(news.content, excerptLength))}</p>
        <a class="btn btn-ghost" href="news.html?id=${encodeURIComponent(news.id)}">Mehr lesen</a>
      </article>
    `).join('');
  },

  getExcerpt(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    const slice = text.slice(0, maxLength + 1);
    const lastSpace = slice.lastIndexOf(' ');
    const minBoundary = Math.floor(maxLength * this.EXCERPT_MIN_WORD_BOUNDARY_RATIO);
    const excerpt = lastSpace > minBoundary ? slice.slice(0, lastSpace) : slice.slice(0, maxLength);
    return excerpt.trimEnd() + '…';
  },

  /** Formatiert ein ISO-Datum ins deutsche Format */
  formatDate(isoDate) {
    try {
      return new Date(isoDate).toLocaleDateString('de-DE', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return isoDate;
    }
  },

  /** Escaped HTML um XSS zu verhindern */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

/* App initialisieren wenn DOM bereit */
document.addEventListener('DOMContentLoaded', () => App.init());
