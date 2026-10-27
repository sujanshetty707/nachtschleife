// Custom cursor: follows mouse with spring lag, ring scales on hover.

let cursorEl: HTMLElement;
let dotEl: HTMLElement;
let ringEl: HTMLElement;

let targetX = 0, targetY = 0;
let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;

export function initCursor(): void {
  cursorEl = document.getElementById('cursor')!;
  dotEl = document.getElementById('cursor-dot')!;
  ringEl = document.getElementById('cursor-ring')!;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; });

  animateCursor();
}

function animateCursor(): void {
  // Dot follows mouse directly
  dotX += (targetX - dotX) * 0.85;
  dotY += (targetY - dotY) * 0.85;

  // Ring follows with spring lag
  ringX += (targetX - ringX) * 0.12;
  ringY += (targetY - ringY) * 0.12;

  dotEl.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  ringEl.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

  requestAnimationFrame(animateCursor);
}
