const ProjectsAdmin = {
  password: '1234',
  sessionKey: 'projects_admin_auth',
  editingId: null,

  init() {
    if (!document.getElementById('projectAdminToggle') || !document.getElementById('projectAdminPanel')) return;
    this.bindEvents();
    this.updateToggle();
    this.renderPanel();
    App.renderProjects();
  },

  isAuthenticated() {
    return sessionStorage.getItem(this.sessionKey) === 'true';
  },

  bindEvents() {
    const toggle = document.getElementById('projectAdminToggle');
    const panel = document.getElementById('projectAdminPanel');
    const grid = document.getElementById('projectsGrid');

    if (toggle) {
      toggle.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) this.renderPanel();
      });
    }

    if (panel) {
      panel.addEventListener('click', event => {
        const action = event.target.dataset.projectAdminAction;
        if (!action) return;

        if (action === 'logout') this.logout();
        if (action === 'cancel') this.cancelEdit();
      });

      panel.addEventListener('submit', event => {
        event.preventDefault();
        if (this.isAuthenticated()) this.save();
        else this.tryLogin();
      });
    }

    if (grid) {
      grid.addEventListener('click', event => {
        const editId = event.target.dataset.projectEdit;
        const deleteId = event.target.dataset.projectDelete;
        if (editId) this.startEdit(editId);
        if (deleteId) this.remove(deleteId);
      });
    }
  },

  updateToggle() {
    const toggle = document.getElementById('projectAdminToggle');
    if (!toggle) return;

    if (this.isAuthenticated()) {
      toggle.textContent = '🛠️';
      toggle.title = 'Projektverwaltung öffnen';
      toggle.setAttribute('aria-label', 'Projektverwaltung öffnen');
    } else {
      toggle.textContent = '🔐';
      toggle.title = 'Projekt-Login öffnen';
      toggle.setAttribute('aria-label', 'Projekt-Login öffnen');
    }
  },

  renderPanel() {
    const panel = document.getElementById('projectAdminPanel');
    if (!panel) return;

    if (!this.isAuthenticated()) {
      panel.innerHTML = `
        <form class="project-admin-card">
          <div>
            <h3>Projekt-Login</h3>
            <p class="text-muted">Mit Demo-Passwort <strong>1234</strong> anmelden, um Projekte hinzuzufügen, zu bearbeiten oder zu löschen.</p>
          </div>
          <div class="project-admin-login-row">
            <input type="password" id="projectAdminPassword" placeholder="Demo-Passwort" autocomplete="off" />
            <button type="submit" data-project-admin-action="login">Anmelden</button>
          </div>
          <div id="projectAdminMessage" class="project-admin-message"></div>
        </form>
      `;
      return;
    }

    const project = this.editingId ? SiteData.projects.find(item => item.id === this.editingId) : null;
    panel.innerHTML = `
      <form class="project-admin-card">
        <div class="project-admin-toolbar">
          <div>
            <h3>${project ? 'Projekt bearbeiten' : 'Neues Projekt'}</h3>
            <p class="text-muted">Änderungen werden direkt lokal gespeichert.</p>
          </div>
          <button type="button" class="btn btn-ghost" data-project-admin-action="logout">Abmelden</button>
        </div>
        <div class="project-admin-form-grid">
          <div class="form-group">
            <label for="projTitle">Titel</label>
            <input type="text" id="projTitle" value="${project ? App.escapeHtml(project.title) : ''}" />
          </div>
          <div class="form-group">
            <label for="projStatus">Status</label>
            <input type="text" id="projStatus" value="${project ? App.escapeHtml(project.status || '') : ''}" placeholder="z.B. In Entwicklung" />
          </div>
          <div class="form-group">
            <label for="projGenre">Genre</label>
            <input type="text" id="projGenre" value="${project ? App.escapeHtml(project.genre || '') : ''}" />
          </div>
          <div class="form-group">
            <label for="projUrl">URL (optional)</label>
            <input type="text" id="projUrl" value="${project ? App.escapeHtml(project.url || '') : ''}" placeholder="z.B. https://... oder demo.html" />
          </div>
        </div>
        <div class="form-group">
          <label for="projDesc">Beschreibung</label>
          <textarea id="projDesc" rows="4">${project ? App.escapeHtml(project.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label for="projTags">Tags (kommagetrennt)</label>
          <input type="text" id="projTags" value="${project ? App.escapeHtml((project.tags || []).join(', ')) : ''}" placeholder="z.B. Demo, Frontend, Tool" />
        </div>
        <div class="project-admin-actions">
          <button type="submit" data-project-admin-action="save">${project ? 'Änderungen speichern' : 'Projekt hinzufügen'}</button>
          <button type="button" class="btn btn-ghost" data-project-admin-action="cancel">${project ? 'Bearbeitung abbrechen' : 'Felder leeren'}</button>
        </div>
        <div id="projectAdminMessage" class="project-admin-message"></div>
      </form>
    `;
  },

  tryLogin() {
    const input = document.getElementById('projectAdminPassword');
    if (!input) return;

    if (input.value === this.password) {
      sessionStorage.setItem(this.sessionKey, 'true');
      this.editingId = null;
      this.updateToggle();
      this.renderPanel();
      App.renderProjects();
      this.setMessage('Erfolgreich angemeldet.', false);
    } else {
      this.setMessage('Falsches Passwort. Bitte 1234 verwenden.', true);
      input.value = '';
      input.focus();
    }
  },

  logout() {
    sessionStorage.removeItem(this.sessionKey);
    this.editingId = null;
    this.updateToggle();
    this.renderPanel();
    App.renderProjects();
  },

  startEdit(id) {
    if (!this.isAuthenticated()) return;
    this.editingId = id;
    const panel = document.getElementById('projectAdminPanel');
    if (panel) panel.hidden = false;
    this.renderPanel();
  },

  cancelEdit() {
    this.editingId = null;
    this.renderPanel();
  },

  save() {
    if (!this.isAuthenticated()) return;

    const title = document.getElementById('projTitle');
    if (!title || !title.value.trim()) {
      this.setMessage('Bitte einen Projekttitel eingeben.', true);
      return;
    }

    const data = {
      title: title.value.trim(),
      status: document.getElementById('projStatus')?.value.trim() || '',
      genre: document.getElementById('projGenre')?.value.trim() || '',
      description: document.getElementById('projDesc')?.value.trim() || '',
      url: document.getElementById('projUrl')?.value.trim() || null,
      tags: (document.getElementById('projTags')?.value || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    };

    const successMessage = this.editingId ? 'Projekt aktualisiert.' : 'Projekt hinzugefügt.';

    if (this.editingId) {
      SiteData.updateProject(this.editingId, data);
    } else {
      SiteData.addProject(data);
    }

    this.editingId = null;
    this.renderPanel();
    this.setMessage(successMessage, false);
    App.renderProjects();
  },

  remove(id) {
    if (!this.isAuthenticated()) return;
    if (!window.confirm('Projekt wirklich löschen?')) return;

    SiteData.deleteProject(id);
    if (this.editingId === id) this.editingId = null;
    this.renderPanel();
    App.renderProjects();
  },

  setMessage(message, isError) {
    const target = document.getElementById('projectAdminMessage');
    if (!target) return;
    target.textContent = message;
    target.classList.toggle('error', !!isError);
  }
};

document.addEventListener('DOMContentLoaded', () => ProjectsAdmin.init());
