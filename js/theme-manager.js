/* =============================================
   Theme Manager – Verwaltet Dark/Light/Rainbow
   ============================================= */

const ThemeManager = {
  themes: ['dark', 'light', 'rainbow'],
  icons: { dark: '🌙', light: '☀️', rainbow: '🌈' },
  labels: { dark: 'Dark Mode', light: 'Light Mode', rainbow: 'Rainbow Mode' },

  /** Initialisiert den Theme-Manager */
  init() {
    const saved = localStorage.getItem('itsolutions_theme');
    const theme = this.themes.includes(saved) ? saved : 'dark';
    this.apply(theme);
    this.bindToggle();
  },

  /** Wendet ein Theme an */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.current = theme;
    localStorage.setItem('itsolutions_theme', theme);
    this.updateButton();
  },

  /** Wechselt zum nächsten Theme */
  cycle() {
    const idx = this.themes.indexOf(this.current);
    const next = this.themes[(idx + 1) % this.themes.length];
    this.apply(next);
  },

  /** Aktualisiert den Theme-Button */
  updateButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.textContent = this.icons[this.current] || '🎨';
    btn.title = this.labels[this.current] || 'Theme wechseln';
    btn.setAttribute('aria-label', 'Theme: ' + (this.labels[this.current] || this.current));
  },

  /** Bindet Click-Event an den Theme-Button */
  bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => this.cycle());
    }
  }
};
