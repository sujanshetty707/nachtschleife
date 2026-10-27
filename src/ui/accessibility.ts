// Accessibility: reduced-motion detection, keyboard navigation, skip link.

let reducedMotion = false;

export function initAccessibility(): void {
  // 1. prefers-reduced-motion media query
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = mq.matches;
  applyReducedMotion(reducedMotion);

  mq.addEventListener('change', (e) => {
    reducedMotion = e.matches;
    applyReducedMotion(reducedMotion);
  });

  // 2. Manual toggle button
  const btn = document.getElementById('btn-reduce-motion')!;
  btn.addEventListener('click', () => {
    reducedMotion = !reducedMotion;
    btn.setAttribute('aria-pressed', String(reducedMotion));
    btn.querySelector('span')!.textContent = reducedMotion ? '✓' : '⟳';
    applyReducedMotion(reducedMotion);
  });

  // 3. Sound toggle button (visual state only — audio module handles audio)
  const soundBtn = document.getElementById('btn-sound-toggle')!;
  window.addEventListener('sound:enable', () => {
    soundBtn.setAttribute('aria-pressed', 'true');
    soundBtn.querySelector('span')!.textContent = '🔊';
  });
  window.addEventListener('sound:disable', () => {
    soundBtn.setAttribute('aria-pressed', 'false');
    soundBtn.querySelector('span')!.textContent = '🔇';
  });

  soundBtn.addEventListener('click', () => {
    const isOn = soundBtn.getAttribute('aria-pressed') === 'true';
    window.dispatchEvent(new CustomEvent(isOn ? 'sound:disable' : 'sound:enable'));
  });
}

function applyReducedMotion(active: boolean): void {
  document.body.classList.toggle('reduced-motion', active);
  window.dispatchEvent(new CustomEvent('a11y:reducedMotion', { detail: { active } }));
}

export function isReducedMotion(): boolean {
  return reducedMotion;
}
