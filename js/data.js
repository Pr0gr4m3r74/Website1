/* =============================================
   Data Store – Zentrale Datenverwaltung
   Alle Inhalte (Games, Projekte, News) werden
   hier definiert und können einfach erweitert werden.
   ============================================= */

const SiteData = {
  /* ── Mini-Games ── */
  games: [
    {
      id: 'kartenspiel',
      title: 'Karten-Altar',
      icon: '🃏',
      description: 'Ziehe Karten, lege sie in den Altar und opfere Kombinationen für Belohnungen. Das bestehende Karten-Mini-Game.',
      url: 'Kartenspiel.html',
      tags: ['Drag & Drop', 'Kartenspiel'],
      isNew: false
    },
    {
      id: 'coinflip',
      title: 'Münzwurf',
      icon: '🪙',
      description: 'Ein schnelles Spiel: Wirf eine Münze und sammle Kopf-/Zahl-Statistiken. Perfekt als kurzes Mini-Game.',
      url: 'minigame-coinflip.html',
      tags: ['Zufall', 'Statistik'],
      isNew: false
    },
    {
      id: 'chess',
      title: 'Schach',
      icon: '♟️',
      description: 'Spiele Schach gegen einen simplen Computergegner. Die Züge werden geloggt – perfekt zum schnellen Taktik-Check.',
      url: 'minigame-chess.html',
      tags: ['Strategie', 'KI'],
      isNew: false
    }
  ],

  /* ── Projekte ── */
  projects: [
    {
      id: 'arcade-arena',
      title: 'Arcade Arena (Demo)',
      status: 'Prototyp',
      genre: 'Top‑Down Shooter',
      description: 'Ein schnelles Arena‑Game mit zufälligen Power‑Ups und Wellen aus Gegnern. Fokus liegt auf flüssiger Steuerung und klaren Effekten.',
      tags: ['WebGL', 'Gameplay Loop', 'Prototype'],
      url: null
    }
  ],

  /* ── Ankündigungen / News ── */
  announcements: [
    {
      id: 'ann-003',
      title: 'Theme-System eingeführt',
      date: '2026-04-03',
      category: 'Feature',
      content: 'Die Website unterstützt jetzt Dark Mode, Light Mode und Rainbow Mode. Wechsle das Theme über das Icon oben rechts in der Navigation.',
      pinned: true
    },
    {
      id: 'ann-002',
      title: 'Schach-KI verbessert',
      date: '2026-03-28',
      category: 'Update',
      content: 'Der Computergegner im Schach-Minispiel wurde optimiert. Er priorisiert jetzt Schachzüge und materialreiche Figuren besser.',
      pinned: false
    },
    {
      id: 'ann-001',
      title: 'Website gestartet',
      date: '2026-03-15',
      category: 'Allgemein',
      content: 'Willkommen auf unserer neuen IT Solutions Website! Hier findest du interaktive Demos, Projekte und Mini-Games.',
      pinned: false
    }
  ],

  /* ── Hilfsfunktionen ── */

  /** Gibt alle Ankündigungen sortiert zurück (gepinnte zuerst, dann nach Datum) */
  getAnnouncements() {
    return [...this.announcements].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });
  },

  /** Findet eine Ankündigung nach ID */
  getAnnouncementById(id) {
    return this.announcements.find(a => a.id === id) || null;
  },

  /** Fügt eine neue Ankündigung hinzu */
  addAnnouncement(announcement) {
    announcement.id = 'ann-' + Date.now();
    this.announcements.unshift(announcement);
    this.persist();
    return announcement;
  },

  /** Aktualisiert eine bestehende Ankündigung */
  updateAnnouncement(id, updates) {
    const idx = this.announcements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    Object.assign(this.announcements[idx], updates);
    this.persist();
    return this.announcements[idx];
  },

  /** Löscht eine Ankündigung */
  deleteAnnouncement(id) {
    const idx = this.announcements.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    this.persist();
    return true;
  },

  /** Fügt ein neues Game hinzu */
  addGame(game) {
    game.id = game.id || 'game-' + Date.now();
    this.games.push(game);
    this.persist();
    return game;
  },

  /** Aktualisiert ein bestehendes Game */
  updateGame(id, updates) {
    const idx = this.games.findIndex(g => g.id === id);
    if (idx === -1) return null;
    Object.assign(this.games[idx], updates);
    this.persist();
    return this.games[idx];
  },

  /** Löscht ein Game */
  deleteGame(id) {
    const idx = this.games.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.games.splice(idx, 1);
    this.persist();
    return true;
  },

  /** Fügt ein neues Projekt hinzu */
  addProject(project) {
    project.id = project.id || 'proj-' + Date.now();
    this.projects.push(project);
    this.persist();
    return project;
  },

  /** Aktualisiert ein bestehendes Projekt */
  updateProject(id, updates) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    Object.assign(this.projects[idx], updates);
    this.persist();
    return this.projects[idx];
  },

  /** Löscht ein Projekt */
  deleteProject(id) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.projects.splice(idx, 1);
    this.persist();
    return true;
  },

  /** Speichert Daten in localStorage */
  persist() {
    try {
      localStorage.setItem('itsolutions_data', JSON.stringify({
        announcements: this.announcements,
        games: this.games,
        projects: this.projects
      }));
    } catch (e) { /* localStorage nicht verfügbar */ }
  },

  /** Lädt gespeicherte Daten aus localStorage */
  load() {
    try {
      const saved = localStorage.getItem('itsolutions_data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.announcements) this.announcements = data.announcements;
        if (data.games) this.games = data.games;
        if (data.projects) this.projects = data.projects;
      }
    } catch (e) { /* localStorage nicht verfügbar */ }
  }
};

/* Beim Laden gespeicherte Daten wiederherstellen */
SiteData.load();
