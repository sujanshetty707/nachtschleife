// Easter eggs — all 10+ discoverable interactions.
// None of these block focus or prevent user interaction.

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

let moonClicks = 0;
let logoClicks = 0;

export function initEasterEggs(): void {
  // ── Easter egg 1: Source comment (in HTML, already planted) ──────────────

  // ── Easter egg 2: Konami code → push-to-pass boost ───────────────────────
  window.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        triggerPushToPass();
      }
    } else {
      konamiIndex = 0;
    }
  });

  // ── Easter egg 3: DevTools console ASCII car + lap message ────────────────
  // (Fired immediately — console is only readable in DevTools)
  /* eslint-disable no-console */
  console.log(
    '%c\n' +
    '      ════════════════════════════════\n' +
    '      █  N A C H T S C H L E I F E  █\n' +
    '      ════════════════════════════════\n' +
    '             ____\n' +
    '          __/    \\___\n' +
    '         /  963 GTP   \\\n' +
    '         |____________|\n' +
    '          (__)(__)(__)\n\n' +
    '      Current lap: loading...\n' +
    '      Personal best: 5:19.546 (Timo Bernhard, 919 Evo)\n' +
    '      You found the console. Box this lap and take a penalty.\n',
    'color: #00d26a; font-family: monospace; font-size: 11px;'
  );
  /* eslint-enable no-console */

  // ── Easter egg 4: 'box' typed anywhere → pit-stop mini-game ──────────────
  let boxBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
      boxBuffer = (boxBuffer + e.key).slice(-3).toLowerCase();
      if (boxBuffer === 'box') {
        boxBuffer = '';
        triggerPitStopGame();
      }
    }
  });

  // ── Easter egg 5: Space bar held → rev limiter ───────────────────────────
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      window.dispatchEvent(new CustomEvent('revlimiter:start'));
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      window.dispatchEvent(new CustomEvent('revlimiter:stop'));
    }
  });

  // ── Easter egg 6: Tab title + favicon follow flag status ─────────────────
  // (handled in scroll update — see ch01-start.ts)

  // ── Easter egg 7: Moon clicks (5x) → sunrise preview ────────────────────
  // Attach to moon object when it exists in scene
  window.addEventListener('moon:click', () => {
    moonClicks++;
    if (moonClicks >= 5) {
      moonClicks = 0;
      window.dispatchEvent(new CustomEvent('weather:sunrise'));
    }
  });

  // ── Easter egg 8: Logo clicks (7x) → red flag screen ────────────────────
  const logo = document.getElementById('logo');
  logo?.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks >= 7) {
      logoClicks = 0;
      triggerRedFlag();
    }
  });

  // ── Easter egg 9: 3-finger tap on mobile → flare ─────────────────────────
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
      window.dispatchEvent(new CustomEvent('flare:trigger'));
    }
  }, { passive: true });

  // ── Easter egg 10: Hold-to-launch (handled in ch10-pitlane.ts) ───────────
}

function triggerPushToPass(): void {
  // Visual boost: chromatic aberration + speed streak + sound
  window.dispatchEvent(new CustomEvent('boost:activate'));
  document.title = '⚡ PUSH TO PASS — NACHTSCHLEIFE';
  setTimeout(() => {
    document.title = 'NACHTSCHLEIFE — One endless night lap of the Nordschleife';
  }, 3000);
}

function triggerPitStopGame(): void {
  // Open pit-stop reaction mini-game
  window.dispatchEvent(new CustomEvent('pitstop:open'));
}

function triggerRedFlag(): void {
  window.dispatchEvent(new CustomEvent('redflag:show'));
  document.title = '🚩 RED FLAG — NACHTSCHLEIFE';
  document.documentElement.setAttribute('data-flag', 'red');
  setTimeout(() => {
    document.title = 'NACHTSCHLEIFE — One endless night lap of the Nordschleife';
    document.documentElement.setAttribute('data-flag', 'green');
  }, 5000);
}
