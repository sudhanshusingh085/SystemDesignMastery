// ============================================================
// Core Java Mastery — Navigation & Utilities
// ============================================================

const NAV_SECTIONS = [
  {
    title: '00 · Java Fundamentals',
    items: [
      { label: '🧱 Java Foundations', href: '/fundamentals/index.html' },
    ]
  },
  {
    title: '01 · Strings Deep Dive',
    items: [
      { label: '🔤 Strings & String Pool', href: '/strings/index.html' },
    ]
  },
  {
    title: '02 · OOP Mastery',
    items: [
      { label: '🧬 OOP Deep Dive', href: '/oop/index.html' },
    ]
  },
  {
    title: '03 · Collections Internals',
    items: [
      { label: '📦 Collections Framework', href: '/collections/index.html' },
    ]
  },
  {
    title: '04 · Java 8 Features',
    items: [
      { label: '⚡ Lambdas, Streams & More', href: '/java8/index.html' },
    ]
  },
  {
    title: '05 · Java 11-21 Modern',
    items: [
      { label: '🚀 Records, Sealed, Virtual Threads', href: '/modern-java/index.html' },
    ]
  },
  {
    title: '06 · Exception Handling',
    items: [
      { label: '⚠️ Exceptions Deep Dive', href: '/exceptions/index.html' },
    ]
  },
  {
    title: '07 · Multithreading',
    items: [
      { label: '🔄 Threads, Locks & Sync', href: '/multithreading/index.html' },
    ]
  },
  {
    title: '08 · Advanced Concurrency',
    items: [
      { label: '🧵 Executors, Futures & Atomics', href: '/concurrency/index.html' },
    ]
  },
  {
    title: '09 · JVM & Memory',
    items: [
      { label: '🧠 JVM Architecture & GC', href: '/jvm-memory/index.html' },
    ]
  },
  {
    title: '10 · Java Internals',
    items: [
      { label: '🔬 ClassLoader, Reflection, Serialization', href: '/internals/index.html' },
    ]
  },
  {
    title: '11 · Generics & Type System',
    items: [
      { label: '🔷 Generics, Wildcards, Erasure', href: '/generics/index.html' },
    ]
  },
  {
    title: '12 · Spring Boot',
    items: [
      { label: '🍃 Spring Boot Deep Dive', href: '/spring-boot/index.html' },
    ]
  },
  {
    title: '13 · Spring Security',
    items: [
      { label: '🔒 Security, JWT, OAuth', href: '/spring-security/index.html' },
    ]
  },
  {
    title: '14 · JPA & Hibernate',
    items: [
      { label: '🗄️ JPA, N+1, Locking', href: '/jpa/index.html' },
    ]
  },
  {
    title: '15 · Kafka & Messaging',
    items: [
      { label: '📨 Kafka Architecture & Deep Dive', href: '/kafka/index.html' },
    ]
  },
  {
    title: '16 · Microservices',
    items: [
      { label: '🧩 Patterns & Architecture', href: '/microservices/index.html' },
    ]
  },
  {
    title: '17 · SQL & Database',
    items: [
      { label: '🗃️ SQL, Indexing, Optimization', href: '/sql/index.html' },
    ]
  },
  {
    title: '18 · Coding & Implementation',
    items: [
      { label: '⌨️ Live Coding Problems', href: '/coding/index.html' },
    ]
  },
  {
    title: '19 · Production Debugging',
    items: [
      { label: '🔥 Real-World Production Issues', href: '/production/index.html' },
      { label: '📡 Java FIX Protocol Issues', href: '/production/fix-protocol.html' },
    ]
  },
  {
    title: '20 · AWS & Deployment',
    items: [
      { label: '☁️ EC2, ECS, Lambda, CI/CD', href: '/aws/index.html' },
    ]
  },
  {
    title: '📖 Reference',
    items: [
      { label: '📖 Glossary (200+ Terms)', href: '/glossary.html' },
    ]
  },
];

// --- Determine the base path ---
function getBasePath() {
  const path = window.location.pathname;
  const idx = path.toLowerCase().indexOf('/corejava');
  if (idx !== -1) return path.substring(0, idx + '/corejava'.length);
  const parts = path.split('/');
  parts.pop();
  const folder = parts[parts.length - 1];
  const topFolders = ['fundamentals','strings','oop','collections','java8','modern-java',
    'exceptions','multithreading','concurrency','jvm-memory','internals','generics',
    'spring-boot','spring-security','jpa','kafka','microservices','sql','coding',
    'production','aws'];
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
      <h2>☕ Core Java Mastery</h2>
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
  const pageKey = 'cjm-notes::' + window.location.pathname;

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
