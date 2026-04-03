/* =============================================
   Admin Panel – Verwaltung von Inhalten
   
   SICHERHEITSHINWEIS:
   Dieser Admin-Bereich ist nur ein Frontend-Schutz.
   Passwörter im Frontend sind NICHT sicher, da sie
   im Quellcode einsehbar sind.
   
   Für eine sichere Lösung wird empfohlen:
   - Serverseitige Authentifizierung (z.B. Node.js/Express)
   - JWT oder Session-basierte Auth
   - Datenbank statt localStorage
   - HTTPS für alle Admin-Operationen
   ============================================= */

const AdminConfig = {
  /* 
   * WARNUNG: Dieses Passwort ist im Quellcode sichtbar!
   * Für Produktivbetrieb unbedingt eine serverseitige
   * Authentifizierung verwenden.
   */
  password: '1234'
};

const AdminPanel = {
  authenticated: false,
  currentSection: 'announcements',
  editingItem: null,
  previewData: null,

  /** Initialisiert den Admin-Bereich */
  init() {
    this.syncSectionFromHash();
    this.checkAuth();
    this.bindEvents();
  },

  /** Prüft ob bereits eingeloggt (Session) */
  checkAuth() {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') {
      this.authenticated = true;
      this.showPanel();
    } else {
      this.showLogin();
    }
  },

  /** Zeigt das Login-Formular */
  showLogin() {
    const overlay = document.getElementById('adminLogin');
    const panel = document.getElementById('adminPanel');
    if (overlay) overlay.style.display = 'flex';
    if (panel) panel.style.display = 'none';
  },

  /** Zeigt das Admin-Panel */
  showPanel() {
    const overlay = document.getElementById('adminLogin');
    const panel = document.getElementById('adminPanel');
    if (overlay) overlay.style.display = 'none';
    if (panel) panel.style.display = '';
    this.updateActiveSection();
    this.renderSection(this.currentSection);
  },

  /** Login-Versuch */
  tryLogin() {
    const input = document.getElementById('adminPassword');
    if (!input) return;
    if (input.value === AdminConfig.password) {
      this.authenticated = true;
      sessionStorage.setItem('admin_auth', 'true');
      this.showPanel();
    } else {
      const errEl = document.getElementById('loginError');
      if (errEl) errEl.textContent = 'Falsches Passwort. Bitte erneut versuchen.';
      input.value = '';
      input.focus();
    }
  },

  /** Logout */
  logout() {
    this.authenticated = false;
    sessionStorage.removeItem('admin_auth');
    this.showLogin();
  },

  /** Bindet alle Events */
  bindEvents() {
    /* Login Button */
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', () => this.tryLogin());
    
    /* Enter-Taste im Passwort-Feld */
    const pwInput = document.getElementById('adminPassword');
    if (pwInput) {
      pwInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.tryLogin();
      });
    }

    /* Sidebar Navigation */
    document.querySelectorAll('[data-admin-section]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.currentSection = btn.dataset.adminSection;
        window.location.hash = this.currentSection;
        this.updateActiveSection();
        this.renderSection(this.currentSection);
      });
    });

    /* Logout Button */
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

    window.addEventListener('hashchange', () => {
      const previousSection = this.currentSection;
      this.syncSectionFromHash();
      if (previousSection !== this.currentSection && this.authenticated) {
        this.updateActiveSection();
        this.renderSection(this.currentSection);
      }
    });
  },

  /** Liest die gewünschte Admin-Sektion aus dem Hash */
  syncSectionFromHash() {
    const section = window.location.hash.replace('#', '').trim();
    if (['announcements', 'games', 'projects'].includes(section)) {
      this.currentSection = section;
    }
  },

  /** Markiert den aktiven Menüpunkt */
  updateActiveSection() {
    document.querySelectorAll('[data-admin-section]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.adminSection === this.currentSection);
    });
  },

  /** Rendert einen Admin-Bereich */
  renderSection(section) {
    const content = document.getElementById('adminContent');
    if (!content) return;

    switch (section) {
      case 'announcements': this.renderAnnouncements(content); break;
      case 'games':         this.renderGames(content); break;
      case 'projects':      this.renderProjects(content); break;
      default: content.innerHTML = '<p>Bereich nicht gefunden.</p>';
    }
  },

  /* ── Ankündigungen ── */
  renderAnnouncements(container) {
    const items = SiteData.getAnnouncements();
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <h2>Ankündigungen</h2>
        <button onclick="AdminPanel.showAnnouncementForm()">+ Neue Ankündigung</button>
      </div>
      <div id="adminFormArea"></div>
      <div id="previewArea"></div>
      <table class="admin-table">
        <thead>
          <tr><th>Datum</th><th>Titel</th><th>Kategorie</th><th>Angeheftet</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const safeId = App.escapeHtml(item.id);
            return `
            <tr>
              <td>${App.escapeHtml(item.date)}</td>
              <td>${App.escapeHtml(item.title)}</td>
              <td><span class="tag">${App.escapeHtml(item.category || '-')}</span></td>
              <td>${item.pinned ? '📌' : '—'}</td>
              <td class="admin-actions">
                <button onclick="AdminPanel.editAnnouncement('${safeId}')">✏️</button>
                <button class="btn-danger" onclick="AdminPanel.deleteAnnouncement('${safeId}')">🗑️</button>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    `;
  },

  showAnnouncementForm(item) {
    const area = document.getElementById('adminFormArea');
    if (!area) return;
    const isEdit = !!item;
    const safeId = isEdit ? App.escapeHtml(item.id) : '';
    area.innerHTML = `
      <div class="admin-form" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-lg);">
        <h3>${isEdit ? 'Ankündigung bearbeiten' : 'Neue Ankündigung'}</h3>
        <div class="form-group">
          <label>Titel</label>
          <input type="text" id="annTitle" value="${isEdit ? App.escapeHtml(item.title) : ''}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Datum</label>
            <input type="date" id="annDate" value="${isEdit ? App.escapeHtml(item.date) : new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label>Kategorie</label>
            <input type="text" id="annCategory" value="${isEdit ? App.escapeHtml(item.category || '') : ''}" placeholder="z.B. Feature, Update, Allgemein" />
          </div>
        </div>
        <div class="form-group">
          <label>Inhalt</label>
          <textarea id="annContent" rows="4">${isEdit ? App.escapeHtml(item.content) : ''}</textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="annPinned" ${isEdit && item.pinned ? 'checked' : ''} style="width: auto; margin-right: 8px;" />
            Ankündigung anheften
          </label>
        </div>
        <div style="display: flex; gap: var(--space-md);">
          <button onclick="AdminPanel.previewAnnouncement('${safeId}')">👁️ Vorschau</button>
          <button onclick="AdminPanel.saveAnnouncement('${safeId}')">💾 Speichern</button>
          <button class="btn-secondary" onclick="AdminPanel.renderSection('announcements')">Abbrechen</button>
        </div>
      </div>
    `;
  },

  previewAnnouncement(editId) {
    const data = this.getAnnouncementFormData();
    if (!data) return;
    const area = document.getElementById('previewArea');
    if (!area) return;
    const escapedEditId = App.escapeHtml(editId);
    area.innerHTML = `
      <div class="preview-panel">
        <h3>📋 Vorschau</h3>
        <article class="news-card" style="max-width: 500px;">
          <div class="news-date">
            ${data.pinned ? '📌 ' : ''}${App.escapeHtml(App.formatDate(data.date))}
            ${data.category ? ` • <span class="tag">${App.escapeHtml(data.category)}</span>` : ''}
          </div>
          <h3 style="color: var(--color-accent);">${App.escapeHtml(data.title)}</h3>
          <p>${App.escapeHtml(data.content)}</p>
        </article>
        <div class="preview-actions">
          <button onclick="AdminPanel.saveAnnouncement('${escapedEditId}')">✅ Bestätigen & Speichern</button>
          <button class="btn-secondary" onclick="document.getElementById('previewArea').innerHTML = ''">Vorschau schließen</button>
        </div>
      </div>
    `;
  },

  getAnnouncementFormData() {
    const title = document.getElementById('annTitle');
    const date = document.getElementById('annDate');
    const category = document.getElementById('annCategory');
    const content = document.getElementById('annContent');
    const pinned = document.getElementById('annPinned');
    if (!title || !title.value.trim()) {
      alert('Bitte Titel eingeben.');
      return null;
    }
    return {
      title: title.value.trim(),
      date: date ? date.value : new Date().toISOString().split('T')[0],
      category: category ? category.value.trim() : '',
      content: content ? content.value.trim() : '',
      pinned: pinned ? pinned.checked : false
    };
  },

  saveAnnouncement(editId) {
    const data = this.getAnnouncementFormData();
    if (!data) return;
    if (editId) {
      SiteData.updateAnnouncement(editId, data);
    } else {
      SiteData.addAnnouncement(data);
    }
    this.renderSection('announcements');
  },

  editAnnouncement(id) {
    const item = SiteData.getAnnouncementById(id);
    if (item) this.showAnnouncementForm(item);
  },

  deleteAnnouncement(id) {
    if (confirm('Ankündigung wirklich löschen?')) {
      SiteData.deleteAnnouncement(id);
      this.renderSection('announcements');
    }
  },

  /* ── Games ── */
  renderGames(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <h2>Mini-Games</h2>
        <button onclick="AdminPanel.showGameForm()">+ Neues Game</button>
      </div>
      <div id="adminFormArea"></div>
      <div id="previewArea"></div>
      <table class="admin-table">
        <thead>
          <tr><th>Icon</th><th>Titel</th><th>URL</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          ${SiteData.games.map(g => {
            const safeId = App.escapeHtml(g.id);
            return `
            <tr>
              <td>${App.escapeHtml(g.icon)}</td>
              <td>${App.escapeHtml(g.title)}</td>
              <td>${App.escapeHtml(g.url)}</td>
              <td class="admin-actions">
                <button onclick="AdminPanel.showGameForm(SiteData.games.find(x=>x.id==='${safeId}'))">✏️</button>
                <button class="btn-danger" onclick="AdminPanel.deleteGameItem('${safeId}')">🗑️</button>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    `;
  },

  showGameForm(item) {
    const area = document.getElementById('adminFormArea');
    if (!area) return;
    const isEdit = !!item;
    const safeId = isEdit ? App.escapeHtml(item.id) : '';
    area.innerHTML = `
      <div class="admin-form" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-lg);">
        <h3>${isEdit ? 'Game bearbeiten' : 'Neues Game'}</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Titel</label>
            <input type="text" id="gameTitle" value="${isEdit ? App.escapeHtml(item.title) : ''}" />
          </div>
          <div class="form-group">
            <label>Icon (Emoji)</label>
            <input type="text" id="gameIcon" value="${isEdit ? App.escapeHtml(item.icon) : ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Beschreibung</label>
          <textarea id="gameDesc" rows="3">${isEdit ? App.escapeHtml(item.description) : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>URL</label>
            <input type="text" id="gameUrl" value="${isEdit ? App.escapeHtml(item.url) : ''}" placeholder="z.B. minigame-xyz.html" />
          </div>
          <div class="form-group">
            <label>Tags (kommagetrennt)</label>
            <input type="text" id="gameTags" value="${isEdit ? App.escapeHtml((item.tags || []).join(', ')) : ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="gameNew" ${isEdit && item.isNew ? 'checked' : ''} style="width: auto; margin-right: 8px;" />
            Als "Neu" markieren
          </label>
        </div>
        <div style="display: flex; gap: var(--space-md);">
          <button onclick="AdminPanel.saveGame('${safeId}')">💾 Speichern</button>
          <button class="btn-secondary" onclick="AdminPanel.renderSection('games')">Abbrechen</button>
        </div>
      </div>
    `;
  },

  saveGame(editId) {
    const title = document.getElementById('gameTitle');
    const icon = document.getElementById('gameIcon');
    const desc = document.getElementById('gameDesc');
    const url = document.getElementById('gameUrl');
    const tags = document.getElementById('gameTags');
    const isNew = document.getElementById('gameNew');
    if (!title || !title.value.trim()) { alert('Bitte Titel eingeben.'); return; }
    const data = {
      title: title.value.trim(),
      icon: icon ? icon.value : '🎮',
      description: desc ? desc.value.trim() : '',
      url: url ? url.value.trim() : '#',
      tags: tags ? tags.value.split(',').map(t => t.trim()).filter(Boolean) : [],
      isNew: isNew ? isNew.checked : false
    };
    if (editId) {
      SiteData.updateGame(editId, data);
    } else {
      SiteData.addGame(data);
    }
    this.renderSection('games');
  },

  deleteGameItem(id) {
    if (confirm('Game wirklich löschen?')) {
      SiteData.deleteGame(id);
      this.renderSection('games');
    }
  },

  /* ── Projekte ── */
  renderProjects(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <h2>Projekte</h2>
        <button onclick="AdminPanel.showProjectForm()">+ Neues Projekt</button>
      </div>
      <div id="adminFormArea"></div>
      <div id="previewArea"></div>
      <table class="admin-table">
        <thead>
          <tr><th>Titel</th><th>Status</th><th>Genre</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          ${SiteData.projects.map(p => {
            const safeId = App.escapeHtml(p.id);
            return `
            <tr>
              <td>${App.escapeHtml(p.title)}</td>
              <td>${App.escapeHtml(p.status)}</td>
              <td>${App.escapeHtml(p.genre)}</td>
              <td class="admin-actions">
                <button onclick="AdminPanel.showProjectForm(SiteData.projects.find(x=>x.id==='${safeId}'))">✏️</button>
                <button class="btn-danger" onclick="AdminPanel.deleteProjectItem('${safeId}')">🗑️</button>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    `;
  },

  showProjectForm(item) {
    const area = document.getElementById('adminFormArea');
    if (!area) return;
    const isEdit = !!item;
    const safeId = isEdit ? App.escapeHtml(item.id) : '';
    area.innerHTML = `
      <div class="admin-form" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-lg);">
        <h3>${isEdit ? 'Projekt bearbeiten' : 'Neues Projekt'}</h3>
        <div class="form-group">
          <label>Titel</label>
          <input type="text" id="projTitle" value="${isEdit ? App.escapeHtml(item.title) : ''}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <input type="text" id="projStatus" value="${isEdit ? App.escapeHtml(item.status) : ''}" placeholder="z.B. Prototyp, In Entwicklung" />
          </div>
          <div class="form-group">
            <label>Genre</label>
            <input type="text" id="projGenre" value="${isEdit ? App.escapeHtml(item.genre) : ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Beschreibung</label>
          <textarea id="projDesc" rows="3">${isEdit ? App.escapeHtml(item.description) : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>URL (optional)</label>
            <input type="text" id="projUrl" value="${isEdit ? App.escapeHtml(item.url || '') : ''}" />
          </div>
          <div class="form-group">
            <label>Tags (kommagetrennt)</label>
            <input type="text" id="projTags" value="${isEdit ? App.escapeHtml((item.tags || []).join(', ')) : ''}" />
          </div>
        </div>
        <div style="display: flex; gap: var(--space-md);">
          <button onclick="AdminPanel.saveProject('${safeId}')">💾 Speichern</button>
          <button class="btn-secondary" onclick="AdminPanel.renderSection('projects')">Abbrechen</button>
        </div>
      </div>
    `;
  },

  saveProject(editId) {
    const title = document.getElementById('projTitle');
    const status = document.getElementById('projStatus');
    const genre = document.getElementById('projGenre');
    const desc = document.getElementById('projDesc');
    const url = document.getElementById('projUrl');
    const tags = document.getElementById('projTags');
    if (!title || !title.value.trim()) { alert('Bitte Titel eingeben.'); return; }
    const data = {
      title: title.value.trim(),
      status: status ? status.value.trim() : '',
      genre: genre ? genre.value.trim() : '',
      description: desc ? desc.value.trim() : '',
      url: url ? url.value.trim() || null : null,
      tags: tags ? tags.value.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    if (editId) {
      SiteData.updateProject(editId, data);
    } else {
      SiteData.addProject(data);
    }
    this.renderSection('projects');
  },

  deleteProjectItem(id) {
    if (confirm('Projekt wirklich löschen?')) {
      SiteData.deleteProject(id);
      this.renderSection('projects');
    }
  }
};

/* Admin-Panel initialisieren wenn DOM bereit */
document.addEventListener('DOMContentLoaded', () => AdminPanel.init());
