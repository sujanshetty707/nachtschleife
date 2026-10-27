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

// ─── Chapters ────────────────────────────────────────────────────────────────
import { initChapter01, updateChapter01 } from './chapters/ch01-start.ts';

// ─── Utils ───────────────────────────────────────────────────────────────────
import { initLoader } from './ui/loader.ts';
import { initCursor } from './ui/cursor.ts';
import { initAccessibility } from './ui/accessibility.ts';
import { initEasterEggs } from './ui/easter-eggs.ts';

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

  // 5. Debug overlay
  initDebug();

  // 6. Accessibility (reduced-motion detection, skip link)
  initAccessibility();

  // 7. Custom cursor
  initCursor();

  // 8. Show loader (ASCII boot terminal + 5-light gantry)
  await initLoader();

  // 9. Init hero chapter (M1)
  initChapter01();

  // 10. Easter eggs
  initEasterEggs();

  // 11. Begin render loop
  requestAnimationFrame(loop);
}

// ─── Main render loop ────────────────────────────────────────────────────────
function loop(): void {
  requestAnimationFrame(loop);
  const dt = renderFrame();

  // Chapter updates
  updateChapter01(dt, scrollState.velocity);

  // Debug overlay
  updateDebug();
}

// ─── Start ───────────────────────────────────────────────────────────────────
boot().catch(console.error);
