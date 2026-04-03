/* =============================================
   App – Hauptlogik (Navigation, Rendering)
   ============================================= */

const App = {
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
      /* Schließe Menü bei Klick auf einen Link */
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });
    }
  },

  /** Rendert dynamische Inhalte basierend auf data-render Attributen */
  renderDynamicContent() {
    /* Games rendern */
    const gamesContainer = document.getElementById('gamesGrid');
    if (gamesContainer) {
      gamesContainer.innerHTML = SiteData.games.map(game => `
        <div class="game-tile">
          <div class="tile-icon">${game.icon}</div>
          <div class="tile-title">${this.escapeHtml(game.title)}${game.isNew ? ' <span class="badge badge-new">Neu</span>' : ''}</div>
          <div class="tile-desc">${this.escapeHtml(game.description)}</div>
          <div style="margin-bottom: var(--space-sm);">
            ${(game.tags || []).map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('')}
          </div>
          <a class="play-btn" href="${this.escapeHtml(game.url)}" aria-label="${this.escapeHtml(game.title)} öffnen">Spiel starten</a>
        </div>
      `).join('');
    }

    /* Projekte rendern */
    const projectsContainer = document.getElementById('projectsGrid');
    if (projectsContainer) {
      projectsContainer.innerHTML = SiteData.projects.map(project => `
        <article class="project-card">
          <h3>${this.escapeHtml(project.title)}</h3>
          <div class="project-meta">Status: ${this.escapeHtml(project.status)} • Genre: ${this.escapeHtml(project.genre)}</div>
          <p>${this.escapeHtml(project.description)}</p>
          <div>
            ${(project.tags || []).map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('')}
          </div>
          ${project.url ? `<a class="play-btn" href="${this.escapeHtml(project.url)}" style="margin-top: var(--space-md); display: inline-block;">Ansehen</a>` : ''}
        </article>
      `).join('');
    }

    /* News rendern */
    const newsContainer = document.getElementById('newsGrid');
    if (newsContainer) {
      const announcements = SiteData.getAnnouncements();
      const limit = newsContainer.dataset.limit ? parseInt(newsContainer.dataset.limit, 10) : announcements.length;
      newsContainer.innerHTML = announcements.slice(0, limit).map(news => `
        <article class="news-card">
          <div class="news-date">
            ${news.pinned ? '📌 ' : ''}${this.formatDate(news.date)}
            ${news.category ? ` • <span class="tag">${this.escapeHtml(news.category)}</span>` : ''}
          </div>
          <h3>${this.escapeHtml(news.title)}</h3>
          <p>${this.escapeHtml(news.content)}</p>
        </article>
      `).join('');
    }
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
