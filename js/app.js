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
      this.renderNewsContent(newsContainer);
    }
  },

  /** Rendert News-Liste oder Detailansicht */
  renderNewsContent(newsContainer) {
    const params = new URLSearchParams(window.location.search);
    const announcementId = this.getCurrentPage() === 'news.html' ? params.get('announcement') : null;

    if (announcementId) {
      this.renderNewsDetail(newsContainer, announcementId, params.get('from'));
      return;
    }

    const announcements = SiteData.getAnnouncements();
    const limit = newsContainer.dataset.limit ? parseInt(newsContainer.dataset.limit, 10) : announcements.length;
    newsContainer.innerHTML = announcements.slice(0, limit).map(news => `
      <article class="news-card">
        <div class="news-date">
          ${news.pinned ? '📌 ' : ''}${this.formatDate(news.date)}
          ${news.category ? ` • <span class="tag">${this.escapeHtml(news.category)}</span>` : ''}
        </div>
        <h3><a class="news-card-link" href="${this.buildAnnouncementHref(news.id)}">${this.escapeHtml(news.title)}</a></h3>
        <p>${this.escapeHtml(this.getExcerpt(news.content))}</p>
        <div class="news-card-actions">
          <a class="news-read-more" href="${this.buildAnnouncementHref(news.id)}">Mehr lesen →</a>
        </div>
      </article>
    `).join('');
  },

  /** Rendert eine News-Detailansicht */
  renderNewsDetail(newsContainer, announcementId, from) {
    const news = SiteData.getAnnouncementById(announcementId);
    const backHref = this.getSafeBackTarget(from);
    const titleEl = document.querySelector('.section-title');
    const descEl = document.querySelector('.section-desc');

    if (titleEl) titleEl.textContent = news ? `📢 ${news.title}` : '📢 News nicht gefunden';
    if (descEl) {
      descEl.textContent = news
        ? `Veröffentlicht am ${this.formatDate(news.date)}${news.category ? ` • ${news.category}` : ''}`
        : 'Die gewünschte Ankündigung konnte nicht geladen werden.';
    }

    newsContainer.innerHTML = news ? `
      <article class="news-card news-detail-card">
        <a class="back-link" href="${this.escapeHtml(backHref)}">← Zurück zur Übersicht</a>
        <div class="news-date">
          ${news.pinned ? '📌 ' : ''}${this.formatDate(news.date)}
          ${news.category ? ` • <span class="tag">${this.escapeHtml(news.category)}</span>` : ''}
        </div>
        <h3>${this.escapeHtml(news.title)}</h3>
        <p>${this.escapeHtml(news.content)}</p>
      </article>
    ` : `
      <article class="news-card news-detail-card">
        <a class="back-link" href="${this.escapeHtml(backHref)}">← Zurück zur Übersicht</a>
        <h3>Ankündigung nicht gefunden</h3>
        <p>Bitte gehe zurück zur Übersicht und öffne die Meldung erneut.</p>
      </article>
    `;
  },

  /** Baut den Detail-Link einer Ankündigung */
  buildAnnouncementHref(id) {
    const params = new URLSearchParams();
    params.set('announcement', id);
    params.set('from', this.getOverviewTarget());
    return `news.html?${params.toString()}`;
  },

  /** Ermittelt das aktuelle Übersichts-Ziel */
  getOverviewTarget() {
    const page = this.getCurrentPage();
    if (page === 'index.html') return 'index.html#newsGrid';
    return 'news.html';
  },

  /** Normalisiert das Rücksprung-Ziel */
  getSafeBackTarget(target) {
    if (!target) return 'news.html';

    try {
      const url = new URL(target, window.location.href);
      const page = url.pathname.split('/').pop() || 'news.html';
      if (!['index.html', 'news.html'].includes(page) || url.origin !== window.location.origin) {
        return 'news.html';
      }
      return `${page}${url.hash || ''}`;
    } catch (e) {
      return 'news.html';
    }
  },

  /** Gibt den aktuellen Dateinamen zurück */
  getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  },

  /** Kürzt Text für Kartenansichten */
  getExcerpt(text) {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= 170) return trimmed;
    return `${trimmed.slice(0, 167).trimEnd()}…`;
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
