/* ============================================
   SQL Server Mastery — Navigation & Utilities
   ============================================ */

const NAV_SECTIONS = [
  {
    title: '🏠 Home',
    items: [
      { label: '🏠 SQL Mastery Home', href: '/index.html' },
    ]
  },
  {
    title: '01 · Fundamentals & DML',
    items: [
      { label: '📋 DDL, DML, Aggregates', href: '/fundamentals.html' },
    ]
  },
  {
    title: '02 · JOINs & Subqueries',
    items: [
      { label: '🔗 All JOIN Types & Subqueries', href: '/joins-subqueries.html' },
    ]
  },
  {
    title: '03 · Window Functions',
    items: [
      { label: '📊 RANK, LAG, Running Totals', href: '/window-functions.html' },
    ]
  },
  {
    title: '04 · Views, CTEs & Temp Tables',
    items: [
      { label: '👁️ Views, CTEs, PIVOT', href: '/views-cte-temp.html' },
    ]
  },
  {
    title: '05 · SPs, Functions & Triggers',
    items: [
      { label: '⚙️ Stored Procs & Error Handling', href: '/stored-procedures.html' },
    ]
  },
  {
    title: '06 · Indexing & Performance',
    items: [
      { label: '⚡ Indexes & Execution Plans', href: '/indexing-performance.html' },
    ]
  },
  {
    title: '07 · Transactions & Locking',
    items: [
      { label: '🔒 ACID, Isolation, Deadlocks', href: '/transactions-locking.html' },
    ]
  },
  {
    title: '🏋️ Exercises',
    items: [
      { label: '🏋️ 50+ Interview Exercises', href: '/exercises.html' },
    ]
  },
];

// --- Determine the base path ---
function getBasePath() {
  const path = window.location.pathname;
  const lower = path.toLowerCase();
  const idxSql = lower.indexOf('/sqlserver');
  if (idxSql !== -1) return path.substring(0, idxSql + '/sqlserver'.length);
  const idxMastery = lower.indexOf('/sqlmastery');
  if (idxMastery !== -1) return path.substring(0, idxMastery + '/sqlmastery'.length);
  
  // Fallback for direct file system access
  const parts = path.split('/');
  parts.pop();
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
      <h2>🗄️ SQL Server Mastery</h2>
      <p>MS SQL Server — Zero → Interview Ready</p>
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
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#dbeafe', primaryTextColor: '#1e293b', primaryBorderColor: '#2563eb',
        lineColor: '#64748b', secondaryColor: '#f1f5f9', tertiaryColor: '#f8fafc',
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px',
      }
    });
  }
}

// --- Notes Widget (localStorage-based, per-page) ---
function setupNotesWidget() {
  const pageKey = 'sqlm-notes::' + window.location.pathname;

  const toggle = document.createElement('button');
  toggle.className = 'notes-toggle';
  toggle.setAttribute('aria-label', 'Toggle notes');
  toggle.textContent = '📝';
  toggle.title = 'My Notes for this page';
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.className = 'notes-panel';
  panel.innerHTML = `
    <div class="notes-header">
      <span>📝 My Notes</span>
      <span class="notes-status"></span>
      <button class="notes-close" title="Close">✕</button>
    </div>
    <div class="notes-body">
      <textarea placeholder="Type your notes here for this page...\n\nSaved automatically in your browser (per page)."
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

  const saved = localStorage.getItem(pageKey);
  if (saved) { textarea.value = saved; toggle.classList.add('has-notes'); status.textContent = '✓ Loaded'; }

  toggle.addEventListener('click', () => { panel.classList.toggle('open'); if (panel.classList.contains('open')) textarea.focus(); });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  let saveTimer;
  textarea.addEventListener('input', () => {
    status.textContent = 'Typing...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const val = textarea.value.trim();
      if (val) { localStorage.setItem(pageKey, textarea.value); toggle.classList.add('has-notes'); status.textContent = '✓ Saved'; }
      else { localStorage.removeItem(pageKey); toggle.classList.remove('has-notes'); status.textContent = 'Empty'; }
    }, 400);
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Delete your notes for this page?')) { textarea.value = ''; localStorage.removeItem(pageKey); toggle.classList.remove('has-notes'); status.textContent = 'Cleared'; }
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) panel.classList.remove('open'); });
}

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  setupMenuToggle();
  setupScrollTop();
  initMermaid();
  setupNotesWidget();
});
