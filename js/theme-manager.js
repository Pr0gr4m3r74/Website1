/* =============================================
   Theme Manager – Verwaltet Dark/Light/Rainbow
   ============================================= */

const ThemeManager = {
  themes: ['dark', 'light', 'rainbow'],
  icons: { dark: '🌙', light: '☀️', rainbow: '🌈' },
  labels: { dark: 'Dark Mode', light: 'Light Mode', rainbow: 'Rainbow Mode' },
  current: 'dark',
  menuOpen: false,

  /** Initialisiert den Theme-Manager */
  init() {
    const saved = localStorage.getItem('itsolutions_theme');
    const theme = this.themes.includes(saved) ? saved : 'dark';
    this.apply(theme);
    this.mountMenu();
    this.bindToggle();
  },

  /** Wendet ein Theme an */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.current = theme;
    localStorage.setItem('itsolutions_theme', theme);
    this.updateButton();
    this.renderMenu();
  },

  /** Erstellt das Dropdown-Menü */
  mountMenu() {
    const btn = document.getElementById('themeToggle');
    if (!btn || btn.dataset.menuReady === 'true') return;

    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switcher';
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.id = 'themeMenu';
    menu.hidden = true;
    wrapper.appendChild(menu);

    btn.dataset.menuReady = 'true';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    this.renderMenu();
  },

  /** Rendert die Menüeinträge */
  renderMenu() {
    const menu = document.getElementById('themeMenu');
    if (!menu) return;

    menu.innerHTML = this.themes.map(theme => `
      <button
        type="button"
        class="theme-menu-item${theme === this.current ? ' active' : ''}"
        data-theme-option="${theme}"
      >
        <span>${this.icons[theme] || '🎨'}</span>
        <span>${this.labels[theme] || theme}</span>
      </button>
    `).join('');

    menu.querySelectorAll('[data-theme-option]').forEach(item => {
      item.addEventListener('click', () => {
        this.apply(item.dataset.themeOption);
        this.closeMenu();
      });
    });
  },

  /** Aktualisiert den Theme-Button */
  updateButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.textContent = this.icons[this.current] || '🎨';
    btn.title = this.labels[this.current] || 'Theme wechseln';
    btn.setAttribute('aria-label', 'Theme-Menü öffnen: ' + (this.labels[this.current] || this.current));
  },

  /** Öffnet oder schließt das Menü */
  toggleMenu() {
    this.menuOpen ? this.closeMenu() : this.openMenu();
  },

  openMenu() {
    const menu = document.getElementById('themeMenu');
    const btn = document.getElementById('themeToggle');
    if (!menu || !btn) return;
    menu.hidden = false;
    this.menuOpen = true;
    btn.setAttribute('aria-expanded', 'true');
  },

  closeMenu() {
    const menu = document.getElementById('themeMenu');
    const btn = document.getElementById('themeToggle');
    if (!menu || !btn) return;
    menu.hidden = true;
    this.menuOpen = false;
    btn.setAttribute('aria-expanded', 'false');
  },

  /** Bindet Events an den Theme-Button */
  bindToggle() {
    const btn = document.getElementById('themeToggle');
    const wrapper = btn ? btn.closest('.theme-switcher') : null;
    if (!btn || !wrapper || btn.dataset.bound === 'true') return;

    btn.addEventListener('click', event => {
      event.stopPropagation();
      this.toggleMenu();
    });

    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) this.closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.closeMenu();
    });

    btn.dataset.bound = 'true';
  }
};
