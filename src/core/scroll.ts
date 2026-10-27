import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ScrollState } from '../types/index.d.ts';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis;
const CHAPTER_COUNT = 12;

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  chapter: 0,
  chapterProgress: 0,
};

export function initScroll(): void {
  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  // Bridge Lenis into GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable gsap ticker lagSmoothing so Lenis stays accurate
  gsap.ticker.lagSmoothing(0);

  // Forward Lenis scroll events to ScrollTrigger
  lenis.on('scroll', ({ progress, velocity }: { progress: number; velocity: number }) => {
    ScrollTrigger.update();
    scrollState.progress = progress;
    scrollState.velocity = velocity;
    scrollState.chapter = Math.min(
      CHAPTER_COUNT - 1,
      Math.floor(progress * CHAPTER_COUNT)
    );
    scrollState.chapterProgress = (progress * CHAPTER_COUNT) % 1;
  });
}

export function getLenis(): Lenis {
  return lenis;
}

/** Temporarily disable smooth scroll (e.g. for horizontal chapter scroll) */
export function disableLenis(): void {
  lenis.stop();
}

export function enableLenis(): void {
  lenis.start();
}

/** Scroll to a specific chapter (0-indexed) */
export function scrollToChapter(index: number): void {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const target = (index / CHAPTER_COUNT) * docH;
  lenis.scrollTo(target, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
}
