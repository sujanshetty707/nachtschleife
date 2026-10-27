/**
 * Top Navigation & Circuit Sector Tracker
 * Route links, active sector indicator, and lap progress bar.
 */

export function initNav(): void {
  let navEl = document.getElementById('main-nav');
  if (!navEl) {
    navEl = document.createElement('nav');
    navEl.id = 'main-nav';
    navEl.setAttribute('aria-label', 'Main navigation');
    navEl.innerHTML = `
      <div class="nav-brand">
        <span class="nav-logo">NACHTSCHLEIFE</span>
        <span class="nav-flag-indicator" id="nav-flag" title="Track Status: Green Flag"></span>
      </div>

      <div class="nav-links">
        <a href="#main-content" class="nav-link active" data-route="lap">01 // THE LAP</a>
        <a href="#garage" class="nav-link" data-route="garage">02 // GARAGE</a>
        <a href="#archive" class="nav-link" data-route="archive">03 // ARCHIVE</a>
        <a href="#telemetry" class="nav-link" data-route="telemetry">04 // TELEMETRY</a>
        <a href="#pit-wall" class="nav-link" data-route="pit-wall">05 // PIT WALL</a>
      </div>

      <div class="nav-progress-track">
        <div id="nav-progress-fill" class="nav-progress-fill"></div>
      </div>
    `;
    document.body.appendChild(navEl);
  }
}

export function updateNavProgress(progress: number): void {
  const fill = document.getElementById('nav-progress-fill');
  if (fill) {
    const clamped = Math.max(0, Math.min(1, progress));
    fill.style.width = `${clamped * 100}%`;
  }
}
