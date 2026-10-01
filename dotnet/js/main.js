// ============================================================
// .NET 8 & C# 12 Mastery — Navigation & Sidebar Utilities
// ============================================================

const DOTNET_NAV_SECTIONS = [
  {
    title: 'Core Interview Curriculum',
    items: [
      { label: '🏛️ .NET Roadmap & Overview', href: '/index.html' },
      { label: '💎 SOLID Principles in C#', href: '/solid/index.html' },
      { label: '📐 GoF & Enterprise Design Patterns', href: '/design-patterns/index.html' },
      { label: '⚡ CQRS & Event Sourcing in .NET 8', href: '/cqrs/index.html' },
      { label: '💉 Dependency Injection & Lifecycles', href: '/dependency-injection/index.html' },
      { label: '🚀 C# Practical Coding & Optimization', href: '/practical-optimization/index.html' }
    ]
  },
  {
    title: 'Deep Architecture & CLR',
    items: [
      { label: '🧱 CLR, JIT & Type System Internals', href: '/fundamentals/index.html' },
      { label: '🗑️ GC, Generations & Memory Management', href: '/memory-gc/index.html' },
      { label: '📦 Collections & Data Structures Internals', href: '/collections/index.html' },
      { label: '🔍 LINQ & Functional C# Encyclopedia', href: '/linq/index.html' },
      { label: '🧵 Async, Tasks & Concurrency Internals', href: '/async-concurrency/index.html' },
      { label: '✨ Modern C# 9-12 Innovations', href: '/modern-csharp/index.html' },
      { label: '🌐 ASP.NET Core & Microservices', href: '/aspnet-core/index.html' },
      { label: '🗄️ EF Core 8 Internals & Performance', href: '/efcore/index.html' },
      { label: '🛡️ .NET Security & Authentication', href: '/security/index.html' }
    ]
  }
];

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/dotnet/')) {
    const idx = path.indexOf('/dotnet/');
    return path.substring(0, idx + 8); // includes '/dotnet/'
  }
  return '/dotnet/';
}

function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const basePath = getBasePath();
  const currentPath = window.location.pathname;

  let html = `
    <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
      <a href="${basePath}index.html" style="text-decoration:none; color: var(--primary); font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>🔷</span> .NET 8 Mastery
      </a>
      <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-top: 0.2rem;">Zero to Principal Architect</span>
    </div>
  `;

  DOTNET_NAV_SECTIONS.forEach(section => {
    html += `<div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; padding-left: 0.5rem;">
        ${section.title}
      </h4>
      <ul style="list-style: none; padding: 0; margin: 0;">`;

    section.items.forEach(item => {
      const fullHref = basePath.replace(/\/$/, '') + item.href;
      const isActive = currentPath.endsWith(item.href) || 
                       (item.href === '/index.html' && (currentPath.endsWith('/dotnet/') || currentPath.endsWith('/dotnet/index.html')));

      html += `
        <li style="margin-bottom: 0.2rem;">
          <a href="${fullHref}" style="
            display: block; 
            padding: 0.4rem 0.6rem; 
            border-radius: var(--radius-sm); 
            text-decoration: none; 
            font-size: 0.88rem; 
            font-weight: ${isActive ? '700' : '500'}; 
            color: ${isActive ? 'var(--primary)' : 'var(--text)'}; 
            background: ${isActive ? 'var(--primary-light)' : 'transparent'};
            transition: all 0.15s ease;
          ">
            ${item.label}
          </a>
        </li>`;
    });

    html += `</ul></div>`;
  });

  sidebar.innerHTML = html;
}

function setupMenuToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function setupScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initMermaid() {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    });
    mermaid.run();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  setupMenuToggle();
  setupScrollTop();
  initMermaid();
});
