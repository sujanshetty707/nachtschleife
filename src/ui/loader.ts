import { gsap } from 'gsap';

const ASCII_CAR = `
      ____
   __/    \\___
  /  NACHTSCHLEIFE  \\
 |  [PROXY CAR]     |
  \\______________  /
   (__) (__)(__)(__)
`;

const BOOT_LINES = [
  'NACHTSCHLEIFE v0.1.0-M1',
  'GPU tier: detecting...',
  'Renderer: WebGL2 + postprocessing',
  'Track data: Nordschleife OSM/ODbL',
  'Audio: Web Audio API (muted)',
  'Reduced motion: off',
  'One lap. All night.',
  'Initialising...',
];

let resolveLoader: () => void;

export function initLoader(): Promise<void> {
  return new Promise((resolve) => {
    resolveLoader = resolve;
    runBoot();
  });
}

async function runBoot(): Promise<void> {
  const asciiEl = document.getElementById('ascii-boot')!;
  const logEl = document.getElementById('boot-log')!;
  const loaderEl = document.getElementById('loader-screen')!;

  // Show ASCII art
  asciiEl.textContent = ASCII_CAR;

  // Type boot log lines
  for (const line of BOOT_LINES) {
    await typeLine(logEl, line, 40);
    await sleep(120);
  }

  // Fire 5 lights, one by one
  await sleep(400);
  const lights = document.querySelectorAll('.light');
  for (const light of lights) {
    light.classList.add('on');
    await sleep(350);
  }

  // Show sound prompt
  await sleep(200);
  const soundPrompt = document.getElementById('sound-prompt')!;
  soundPrompt.hidden = false;

  document.getElementById('btn-sound-on')!.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sound:enable'));
    lightsOut(loaderEl);
  }, { once: true });

  document.getElementById('btn-sound-off')!.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sound:disable'));
    lightsOut(loaderEl);
  }, { once: true });
}

function lightsOut(loaderEl: HTMLElement): void {
  // Lights go out
  const lights = document.querySelectorAll('.light');
  lights.forEach(l => l.classList.remove('on'));

  // Short pause → whip-pan out
  setTimeout(() => {
    gsap.to(loaderEl, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        loaderEl.remove();
        // Show accessibility bar
        document.getElementById('a11y-bar')!.hidden = false;
        resolveLoader();
      },
    });
  }, 600);
}

function typeLine(el: HTMLElement, text: string, speed: number): Promise<void> {
  return new Promise((res) => {
    let i = 0;
    const line = document.createElement('div');
    el.appendChild(line);
    const interval = setInterval(() => {
      line.textContent += text[i] ?? '';
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        res();
      }
    }, speed);
  });
}

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));
