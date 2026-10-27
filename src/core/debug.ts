import { getRenderer, getSmoothedFPS } from './renderer.ts';
import { qualityConfig } from './quality.ts';
import { scrollState } from './scroll.ts';

let overlay: HTMLElement;
let fpsEl: HTMLElement;
let callsEl: HTMLElement;
let tierEl: HTMLElement;
let chapterEl: HTMLElement;
let active = false;

export function initDebug(): void {
  overlay = document.getElementById('debug-overlay')!;
  fpsEl = document.getElementById('dbg-fps')!;
  callsEl = document.getElementById('dbg-calls')!;
  tierEl = document.getElementById('dbg-tier')!;
  chapterEl = document.getElementById('dbg-chapter')!;

  if (new URLSearchParams(window.location.search).has('debug')) {
    overlay.hidden = false;
    active = true;
  }

  // Toggle with backtick key
  window.addEventListener('keydown', (e) => {
    if (e.key === '`') {
      active = !active;
      overlay.hidden = !active;
    }
  });
}

export function updateDebug(): void {
  if (!active) return;
  const renderer = getRenderer();
  fpsEl.textContent = `${getSmoothedFPS()} fps`;
  callsEl.textContent = `${renderer.info.render.calls} calls`;
  tierEl.textContent = `tier: ${qualityConfig.tier}`;
  chapterEl.textContent = `ch: ${scrollState.chapter} (${(scrollState.progress * 100).toFixed(1)}%)`;
}
