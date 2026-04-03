/* =============================================
   Theme Manager – Verwaltet Dark/Light/Rainbow
   ============================================= */

const ThemeManager = {
  themes: ['dark', 'light', 'rainbow'],
  icons: { dark: '🌙', light: '☀️', rainbow: '🌈' },
  labels: { dark: 'Darkmode', light: 'Whitemode', rainbow: 'Rainbow' },
  current: 'dark',
  menuOpen: false,

  /** Initialisiert den Theme-Manager */
  init() {
    const saved = localStorage.getItem('itsolutions_theme');
    const theme = this.themes.includes(saved) ? saved : 'dark';
    this.apply(theme, false);
    this.setupMenu();
    this.bindEvents();
  },

  /** Wendet ein Theme an */
  apply(theme, closeMenu = true) {
    document.documentElement.setAttribute('data-theme', theme);
    this.current = theme;
    localStorage.setItem('itsolutions_theme', theme);
    this.updateButton();
    this.updateMenu();
    if (closeMenu) this.closeMenu();
  },

  /** Baut das Theme-Menü um den Button herum auf */
  setupMenu() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    let wrapper = btn.parentElement;
    if (!wrapper || !wrapper.classList.contains('theme-menu')) {
      wrapper = document.createElement('div');
      wrapper.className = 'theme-menu';
      btn.parentNode.insertBefore(wrapper, btn);
      wrapper.appendChild(btn);
    }

    let menu = wrapper.querySelector('.theme-dropdown');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'theme-dropdown';
      menu.setAttribute('role', 'menu');
      menu.innerHTML = this.themes.map(theme => `
        <button type="button" class="theme-option" data-theme-option="${theme}" role="menuitemradio" aria-checked="false">
          <span class="theme-option-icon">${this.icons[theme] || '🎨'}</span>
          <span class="theme-option-label">${this.labels[theme] || theme}</span>
        </button>
      `).join('');
      wrapper.appendChild(menu);
    }

    this.buttonEl = btn;
    this.menuEl = menu;
    this.updateButton();
    this.updateMenu();
  },

  /** Aktualisiert den Theme-Button */
  updateButton() {
    const btn = this.buttonEl || document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = `
      <span class="theme-btn-icon">${this.icons[this.current] || '🎨'}</span>
      <span class="theme-btn-caret" aria-hidden="true">▾</span>
    `;
    btn.title = `Theme wählen: ${this.labels[this.current] || this.current}`;
    btn.setAttribute('aria-label', `Theme wählen: ${this.labels[this.current] || this.current}`);
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', String(this.menuOpen));
  },

  /** Aktualisiert das Dropdown-Menü */
  updateMenu() {
    if (!this.menuEl || !this.buttonEl) return;
    const wrapper = this.buttonEl.parentElement;
    if (wrapper) wrapper.classList.toggle('open', this.menuOpen);
    this.menuEl.querySelectorAll('[data-theme-option]').forEach(option => {
      const isActive = option.dataset.themeOption === this.current;
      option.classList.toggle('active', isActive);
      option.setAttribute('aria-checked', String(isActive));
    });
  },

  /** Öffnet oder schließt das Menü */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.updateButton();
    this.updateMenu();
  },

  /** Schließt das Menü */
  closeMenu() {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.updateButton();
    this.updateMenu();
  },

  /** Bindet Events an Button und Menü */
  bindEvents() {
    const btn = this.buttonEl || document.getElementById('themeToggle');
    if (!btn || btn.dataset.themeBound === 'true') return;

    btn.dataset.themeBound = 'true';
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleMenu();
    });

    if (this.menuEl) {
      this.menuEl.addEventListener('click', event => {
        const option = event.target.closest('[data-theme-option]');
        if (!option) return;
        event.preventDefault();
        event.stopPropagation();
        this.apply(option.dataset.themeOption);
      });
    }

    document.addEventListener('click', event => {
      const wrapper = this.buttonEl ? this.buttonEl.parentElement : null;
      if (wrapper && !wrapper.contains(event.target)) this.closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.closeMenu();
    });
  }
};
