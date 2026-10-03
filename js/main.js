/* ============================================
   System Design Mastery — Main JavaScript
   Full 24-section navigation
   ============================================ */

// --- Immediate Theme Initialization (prevents FOUC) ---
(function initThemeImmediately() {
  try {
    const saved = localStorage.getItem('sdm-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.warn('Theme init error:', e);
  }
})();

const NAV_SECTIONS = [
  {
    title: '00 · Foundations',
    items: [
      { label: '🏠 Home', href: '/index.html' },
      { label: '☕ Core Java Guide', href: '/corejava/index.html' },
      { label: '🔷 .NET 8 / C# 12', href: '/dotnet/index.html' },
      { label: '🗄️ SQL Server Guide', href: '/sqlserver/index.html' },
      { label: 'What is System Design?', href: '/fundamentals/what-is-system-design.html' },
      { label: 'Client & Server', href: '/fundamentals/client-server.html' },
    ]
  },
  {
    title: '01 · Requirement Gathering',
    items: [
      { label: '🎯 RADIO Framework', href: '/interview/methodology.html' },
      { label: '❓ Questions to Ask', href: '/interview/requirement-gathering.html' },
    ]
  },
  {
    title: '02 · OOP Fundamentals',
    items: [
      { label: '🧬 OOP Deep Dive', href: '/oop/index.html' },
    ]
  },
  {
    title: '03 · Java Design Fundamentals',
    items: [
      { label: '☕ Java 21 Constructs', href: '/java-design/index.html' },
    ]
  },
  {
    title: '04 · SOLID Principles',
    items: [
      { label: '🧱 SOLID with Code', href: '/lld/solid.html' },
    ]
  },
  {
    title: '05 · Design Patterns',
    items: [
      { label: '📋 Patterns Overview', href: '/lld/design-patterns/index.html' },
      { label: 'Creational', href: '/lld/design-patterns/creational.html' },
      { label: 'Structural', href: '/lld/design-patterns/structural.html' },
      { label: 'Behavioral', href: '/lld/design-patterns/behavioral.html' },
    ]
  },
  {
    title: '06 · Concurrency',
    items: [
      { label: '🔄 Concurrency & Threads', href: '/concurrency/index.html' },
    ]
  },
  {
    title: '07 · LLD Principles',
    items: [
      { label: '📐 DRY, KISS, YAGNI & more', href: '/lld-principles/index.html' },
    ]
  },
  {
    title: '08 · Machine Coding',
    items: [
      { label: '⌨️ Approach & Template', href: '/machine-coding/index.html' },
    ]
  },
  {
    title: '09 · API Design',
    items: [
      { label: '🔌 REST, Pagination, Errors', href: '/api-design/index.html' },
    ]
  },
  {
    title: '10 · Database Design',
    items: [
      { label: '🗄️ Normalization, ER, Index', href: '/database-design/index.html' },
    ]
  },
  {
    title: '11 · Networking',
    items: [
      { label: '🌐 HTTP, DNS, TCP, Ports', href: '/fundamentals/networking-basics.html' },
    ]
  },
  {
    title: '12 · Distributed Systems',
    items: [
      { label: '🌍 CAP, Consensus, Consistency', href: '/distributed-systems/index.html' },
    ]
  },
  {
    title: '13 · Caching',
    items: [
      { label: '⚡ Strategies & LRU Code', href: '/hld/caching.html' },
    ]
  },
  {
    title: '14 · Messaging / Kafka',
    items: [
      { label: '📨 Queues, Pub-Sub, Kafka', href: '/hld/message-queues.html' },
    ]
  },
  {
    title: '15 · Microservices',
    items: [
      { label: '🧩 Monolith → Microservices', href: '/hld/microservices.html' },
    ]
  },
  {
    title: '16 · Reliability & Fault Tolerance',
    items: [
      { label: '🛡️ Circuit Breaker, Retry, etc.', href: '/reliability/index.html' },
    ]
  },
  {
    title: '17 · Observability',
    items: [
      { label: '📊 Monitoring, Logging, Tracing', href: '/observability/index.html' },
    ]
  },
  {
    title: '18 · Security',
    items: [
      { label: '🔒 Auth, OAuth, JWT, HTTPS', href: '/security/index.html' },
    ]
  },
  {
    title: '19 · Scalability',
    items: [
      { label: '📈 Scaling Deep Dive', href: '/scalability/index.html' },
    ]
  },
  {
    title: '20 · HLD Building Blocks',
    items: [
      { label: '🏗️ All Components Reference', href: '/hld-building-blocks/index.html' },
      { label: '⏱️ Rate Limiter Masterclass', href: '/hld/rate-limiter.html' },
      { label: '⚖️ Why This, Why Not That?', href: '/hld/architectural-decisions.html' },
    ]
  },
  {
    title: '21 · HLD Problems',
    items: [
      { label: '⏱️ Rate Limiter System', href: '/hld/rate-limiter.html' },
      { label: '🔗 URL Shortener', href: '/hld/case-studies/url-shortener.html' },
      { label: '💬 Chat System', href: '/hld/case-studies/chat-system.html' },
      { label: '📰 News Feed', href: '/hld/case-studies/news-feed.html' },
      { label: '🔔 Notification System', href: '/hld/case-studies/notification.html' },
    ]
  },
  {
    title: '22 · LLD / Machine Coding Problems',
    items: [
      { label: '🅿️ Parking Lot', href: '/lld/case-studies/parking-lot.html' },
      { label: '🛗 Elevator', href: '/lld/case-studies/elevator.html' },
      { label: '🥤 Vending Machine', href: '/lld/case-studies/vending-machine.html' },
      { label: '🏧 ATM', href: '/lld/case-studies/atm.html' },
      { label: '📚 Library', href: '/lld/case-studies/library.html' },
      { label: '⭕ Tic-Tac-Toe', href: '/lld/case-studies/tic-tac-toe.html' },
      { label: '♟️ Chess', href: '/lld/case-studies/chess.html' },
      { label: '💰 Splitwise', href: '/lld/case-studies/splitwise.html' },
      { label: '🎬 Movie Booking', href: '/lld/case-studies/movie-booking.html' },
      { label: '🚗 Car Rental', href: '/lld/case-studies/car-rental.html' },
      { label: '🍔 Food Ordering', href: '/lld/case-studies/food-ordering.html' },
      { label: '💳 Payment System', href: '/lld/case-studies/payment-system.html' },
      { label: '📦 Inventory', href: '/lld/case-studies/inventory.html' },
      { label: '🚕 Ride Sharing', href: '/lld/case-studies/ride-sharing.html' },
    ]
  },
  {
    title: '23 · Production & Interview',
    items: [
      { label: '🔥 Production Failures', href: '/production-failures/index.html' },
      { label: '🎤 Interview Simulations', href: '/interview-simulations/index.html' },
      { label: '📖 Glossary', href: '/glossary.html' },
    ]
  },
];

// --- Determine the base path ---
function getBasePath() {
  const path = window.location.pathname;
  const idx = path.toLowerCase().indexOf('/architecture');
  if (idx !== -1) return path.substring(0, idx + '/architecture'.length);
  if (path.includes('/case-studies/')) return path.substring(0, path.lastIndexOf('/', path.lastIndexOf('/case-studies/') - 1));
  if (path.includes('/design-patterns/')) return path.substring(0, path.lastIndexOf('/', path.lastIndexOf('/design-patterns/') - 1));
  const parts = path.split('/');
  parts.pop();
  // Check if we're in a subfolder
  const folder = parts[parts.length - 1];
  const topFolders = ['fundamentals','interview','hld','lld','oop','java-design','concurrency',
    'lld-principles','machine-coding','api-design','database-design','distributed-systems',
    'reliability','observability','security','scalability','hld-building-blocks',
    'production-failures','interview-simulations'];
  if (topFolders.includes(folder)) {
    parts.pop();
    return parts.join('/');
  }
  return parts.join('/');
}

function resolveHref(href) { return getBasePath() + href; }

function isCurrentPage(href) {
  const current = decodeURIComponent(window.location.pathname);
  return current.endsWith(href);
}

// --- Build Sidebar ---
function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let html = `
    <div class="sidebar-header">
      <h2>🏗️ System Design Mastery</h2>
      <p>Zero → Interview Ready (Java 21)</p>
    </div>
    <nav><ul class="sidebar-nav">`;

  NAV_SECTIONS.forEach(section => {
    html += `<li class="section-title">${section.title}</li>`;
    section.items.forEach(item => {
      const active = isCurrentPage(item.href) ? ' active' : '';
      html += `<li><a href="${resolveHref(item.href)}" class="${active}">${item.label}</a></li>`;
    });
  });

  html += `</ul></nav>`;
  sidebar.innerHTML = html;
}

// --- Mobile Menu ---
function setupMenuToggle() {
  const btn = document.querySelector('.menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== btn) {
      sidebar.classList.remove('open');
    }
  });
}

// --- Scroll to Top ---
function setupScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- Mermaid ---
function initMermaid() {
  const m = window.mermaid || (typeof mermaid !== 'undefined' ? mermaid : null);
  if (m) {
    try {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      m.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'base',
        themeVariables: isDark ? {
          darkMode: true,
          background: '#151e2e',
          primaryColor: '#1e293b',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#38bdf8',
          lineColor: '#94a3b8',
          secondaryColor: '#0f172a',
          tertiaryColor: '#1e293b',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '14px',
        } : {
          primaryColor: '#dbeafe', primaryTextColor: '#1e293b', primaryBorderColor: '#2563eb',
          lineColor: '#64748b', secondaryColor: '#f1f5f9', tertiaryColor: '#f8fafc',
          fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px',
        }
      });
      if (typeof m.run === 'function') {
        m.run().catch(err => console.warn('Mermaid render warning:', err));
      } else if (typeof m.contentLoaded === 'function') {
        m.contentLoaded();
      }
    } catch (e) {
      console.warn('Mermaid initialization warning:', e);
    }
  }
}

// --- Notes Widget (localStorage-based, per-page) ---
function setupNotesWidget() {
  const pageKey = 'sdm-notes::' + window.location.pathname;

  // Create toggle button
  const toggle = document.createElement('button');
  toggle.className = 'notes-toggle';
  toggle.setAttribute('aria-label', 'Toggle notes');
  toggle.textContent = '📝';
  toggle.title = 'My Notes for this page';
  document.body.appendChild(toggle);

  // Create panel
  const panel = document.createElement('div');
  panel.className = 'notes-panel';
  panel.innerHTML = `
    <div class="notes-header">
      <span>📝 My Notes</span>
      <span class="notes-status"></span>
      <button class="notes-close" title="Close">✕</button>
    </div>
    <div class="notes-body">
      <textarea placeholder="Type your notes here for this page...\n\nYour notes are saved automatically in your browser and will persist forever (per page)."
        spellcheck="true"></textarea>
    </div>
    <div class="notes-footer">
      <span class="notes-info">Saved in your browser (localStorage)</span>
      <button class="notes-clear" title="Delete notes for this page">🗑️ Clear</button>
    </div>
  `;
  document.body.appendChild(panel);

  const textarea = panel.querySelector('textarea');
  const status = panel.querySelector('.notes-status');
  const closeBtn = panel.querySelector('.notes-close');
  const clearBtn = panel.querySelector('.notes-clear');

  // Load saved notes
  const saved = localStorage.getItem(pageKey);
  if (saved) {
    textarea.value = saved;
    toggle.classList.add('has-notes');
    status.textContent = '✓ Loaded';
  }

  // Toggle panel
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) textarea.focus();
  });

  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Auto-save with debounce
  let saveTimer;
  textarea.addEventListener('input', () => {
    status.textContent = 'Typing...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const val = textarea.value.trim();
      if (val) {
        localStorage.setItem(pageKey, textarea.value);
        toggle.classList.add('has-notes');
        status.textContent = '✓ Saved';
      } else {
        localStorage.removeItem(pageKey);
        toggle.classList.remove('has-notes');
        status.textContent = 'Empty';
      }
    }, 400);
  });

  // Clear notes
  clearBtn.addEventListener('click', () => {
    if (confirm('Delete your notes for this page?')) {
      textarea.value = '';
      localStorage.removeItem(pageKey);
      toggle.classList.remove('has-notes');
      status.textContent = 'Cleared';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) panel.classList.remove('open');
  });
}

/* --- Multi-Language Code Tabs Setup --- */
function setupCodeTabs() {
  const DEFAULT_LANG = localStorage.getItem('sdm-code-lang') || 'java';

  function activateTab(lang) {
    localStorage.setItem('sdm-code-lang', lang);
    document.querySelectorAll('.code-tabs').forEach(container => {
      const btns = container.querySelectorAll('.code-tab-btn');
      const contents = container.querySelectorAll('.code-tab-content');
      
      let matched = false;
      btns.forEach(b => {
        if (b.dataset.tab === lang) {
          b.classList.add('active');
          matched = true;
        } else {
          b.classList.remove('active');
        }
      });
      
      contents.forEach(c => {
        if (c.dataset.tabContent === lang) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      // fallback to first tab if this container doesn't have target lang
      if (!matched && btns.length > 0) {
        btns[0].classList.add('active');
        if (contents.length > 0) contents[0].classList.add('active');
      }
    });
  }

  // Bind click handlers
  document.querySelectorAll('.code-tabs').forEach(container => {
    container.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.tab;
        activateTab(lang);
      });
    });
  });

  // Initial activation based on stored preference
  activateTab(DEFAULT_LANG);
}

// --- Theme Toggle Floating Button ---
function setupThemeToggle() {
  let toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark or light theme');
    document.body.appendChild(toggle);
  }

  function updateToggleIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.documentElement.classList.contains('dark');
    toggle.innerHTML = isDark ? '☀️' : '🌙';
    toggle.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('sdm-theme', nextTheme);
    } catch (e) {}
    updateToggleIcon();
  });

  updateToggleIcon();
}

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  setupMenuToggle();
  setupScrollTop();
  initMermaid();
  setupNotesWidget();
  setupCodeTabs();
  setupThemeToggle();
});

