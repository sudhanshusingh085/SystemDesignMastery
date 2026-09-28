/* ============================================
   System Design Mastery — Main JavaScript
   Full 24-section navigation
   ============================================ */

const NAV_SECTIONS = [
  {
    title: '00 · Foundations',
    items: [
      { label: '🏠 Home', href: '/index.html' },
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
    ]
  },
  {
    title: '21 · HLD Problems',
    items: [
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

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  setupMenuToggle();
  setupScrollTop();
  initMermaid();
});
