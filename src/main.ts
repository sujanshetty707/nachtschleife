// ─── Font imports ─────────────────────────────────────────────────────────────
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/martian-mono';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/barlow-semi-condensed/400.css';
import '@fontsource/barlow-semi-condensed/500.css';
import '@fontsource/vt323/400.css';
import '@fontsource/monoton/400.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

// ─── Core systems ─────────────────────────────────────────────────────────────
import './style.css';
import { initQuality } from './core/quality.ts';
import { initRenderer, renderFrame } from './core/renderer.ts';
import { initScroll, scrollState } from './core/scroll.ts';
import { initDebug, updateDebug } from './core/debug.ts';
import { initAudio, enableAudio, disableAudio, updateAudioVelocity } from './core/audio.ts';

// ─── Chapters & Lap Orchestrator ─────────────────────────────────────────────
import { initChapter01, updateChapter01 } from './chapters/ch01-start.ts';
import { initLapController, updateLapController } from './core/lap-controller.ts';

// ─── UI & HUD ────────────────────────────────────────────────────────────────
import { initLoader } from './ui/loader.ts';
import { initCursor } from './ui/cursor.ts';
import { initAccessibility } from './ui/accessibility.ts';
import { initEasterEggs } from './ui/easter-eggs.ts';
import { initHUD } from './ui/hud.ts';
import { initNav } from './ui/nav.ts';

// ─── Boot sequence ───────────────────────────────────────────────────────────
async function boot(): Promise<void> {
  // 1. Detect GPU and set quality tier first
  await initQuality();

  // 2. Check WebGL2 support
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement;
  if (!canvas.getContext('webgl2')) {
    document.getElementById('no-webgl')?.removeAttribute('hidden');
    return;
  }

  // 3. Init renderer (Three.js + postprocessing)
  initRenderer(canvas);

  // 4. Init scroll (Lenis + ScrollTrigger)
  initScroll();

  // 5. Audio system
  initAudio();
  window.addEventListener('sound:enable', () => { enableAudio(); });
  window.addEventListener('sound:disable', () => { disableAudio(); });

  // 6. Debug overlay
  initDebug();

  // 7. Accessibility (reduced-motion detection, skip link)
  initAccessibility();

  // 8. Custom cursor
  initCursor();

  // 9. Show loader (ASCII boot terminal + 5-light gantry)
  await initLoader();

  // 10. Nav & Telemetry HUD
  initNav();
  initHUD();

  // 11. Init 3D Lap Controller & Chapter 01
  initLapController();
  initChapter01();

  // 12. Easter eggs
  initEasterEggs();

  // 13. Begin render loop
  requestAnimationFrame(loop);
}

// ─── Main render loop ────────────────────────────────────────────────────────
function loop(): void {
  requestAnimationFrame(loop);
  const dt = renderFrame();

  // Audio throttle updates based on scroll velocity
  updateAudioVelocity(scrollState.velocity);

  // Lap controller & 3D track/car traversal
  updateLapController(dt, scrollState.progress, scrollState.velocity);

  // Chapter 01 updates
  updateChapter01(dt, scrollState.velocity);

  // Debug overlay
  updateDebug();
}

// ─── Start ───────────────────────────────────────────────────────────────────
boot().catch(console.error);
