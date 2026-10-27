import * as THREE from 'three';
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  DepthOfFieldEffect,
  VignetteEffect,
  ChromaticAberrationEffect,
  NoiseEffect,
  EffectPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';
import { qualityConfig } from './quality.ts';

let renderer: THREE.WebGLRenderer;
let composer: EffectComposer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let clock: THREE.Clock;

// Dynamic resolution scaling
let fpsBuffer: number[] = [];
let lowFpsFrames = 0;
const LOW_FPS_THRESHOLD = 50;
const LOW_FPS_COUNT_LIMIT = 120; // ~2s at 60fps

// Post-processing effects (exposed for per-chapter control)
export let bloomEffect: BloomEffect;
export let chromaticAberrationEffect: ChromaticAberrationEffect;
export let vignetteEffect: VignetteEffect;
export let dofEffect: DepthOfFieldEffect | null = null;
export let noiseEffect: NoiseEffect;

export function getRenderer(): THREE.WebGLRenderer { return renderer; }
export function getComposer(): EffectComposer { return composer; }
export function getScene(): THREE.Scene { return scene; }
export function getCamera(): THREE.PerspectiveCamera { return camera; }
export function getClock(): THREE.Clock { return clock; }

export function initRenderer(canvas: HTMLCanvasElement): void {
  clock = new THREE.Clock();

  // ─── Renderer ───────────────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // SMAA handles AA in postprocessing
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.setPixelRatio(qualityConfig.dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.NoToneMapping; // postprocessing handles this
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = qualityConfig.shadowMapSize > 0;
  if (renderer.shadowMap.enabled) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // ─── Scene ──────────────────────────────────────────────────────────────
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050508, 0.008);

  // ─── Camera ─────────────────────────────────────────────────────────────
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 2, 8);

  // ─── Post-processing ────────────────────────────────────────────────────
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // SMAA anti-aliasing
  const smaaEffect = new SMAAEffect();

  // Bloom (emissives only — luminanceThreshold set high)
  bloomEffect = new BloomEffect({
    intensity: 1.2,
    luminanceThreshold: 0.7,
    luminanceSmoothing: 0.2,
    mipmapBlur: true,
  });

  // Chromatic aberration (driven by scroll velocity in update)
  chromaticAberrationEffect = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.0, 0.0),
    radialModulation: true,
    modulationOffset: 0.0,
  });

  // Vignette
  vignetteEffect = new VignetteEffect({
    eskil: false,
    offset: 0.35,
    darkness: 0.6,
  });

  // Film grain
  noiseEffect = new NoiseEffect({ premultiply: true });
  noiseEffect.blendMode.opacity.value = 0.08;

  // ACES tone mapping
  const toneMappingEffect = new ToneMappingEffect({
    mode: ToneMappingMode.ACES_FILMIC,
    resolution: 256,
    whitePoint: 4.0,
    middleGrey: 0.6,
    minLuminance: 0.01,
    averageLuminance: 1.0,
    adaptationRate: 2.0,
  });

  // DoF (only on high/ultra)
  if (qualityConfig.dofEnabled) {
    dofEffect = new DepthOfFieldEffect(camera, {
      focusDistance: 0.0,
      focalLength: 0.05,
      bokehScale: 3.0,
    });
    composer.addPass(new EffectPass(camera, smaaEffect, bloomEffect, dofEffect, chromaticAberrationEffect, vignetteEffect, noiseEffect, toneMappingEffect));
  } else {
    composer.addPass(new EffectPass(camera, smaaEffect, bloomEffect, chromaticAberrationEffect, vignetteEffect, noiseEffect, toneMappingEffect));
  }

  // ─── Resize handler ─────────────────────────────────────────────────────
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ─── Quality downgrade listener ─────────────────────────────────────────
  window.addEventListener('quality:changed', () => {
    renderer.setPixelRatio(qualityConfig.dpr);
    renderer.shadowMap.enabled = qualityConfig.shadowMapSize > 0;
  });
}

/** Call every frame from the main loop. Returns delta time in seconds. */
export function renderFrame(): number {
  const dt = clock.getDelta();

  // Dynamic resolution scaling: track FPS over 2-second window
  const fps = dt > 0 ? 1 / dt : 60;
  fpsBuffer.push(fps);
  if (fpsBuffer.length > 120) fpsBuffer.shift();

  if (fps < LOW_FPS_THRESHOLD) {
    lowFpsFrames++;
    if (lowFpsFrames >= LOW_FPS_COUNT_LIMIT) {
      lowFpsFrames = 0;
      import('./quality.ts').then(({ downgradeTier }) => downgradeTier());
    }
  } else {
    lowFpsFrames = Math.max(0, lowFpsFrames - 2);
  }

  // Pause rendering when tab hidden
  if (!document.hidden) {
    composer.render(dt);
  }

  return dt;
}

/** Current smoothed FPS (for debug overlay). */
export function getSmoothedFPS(): number {
  if (fpsBuffer.length === 0) return 0;
  const avg = fpsBuffer.reduce((a, b) => a + b, 0) / fpsBuffer.length;
  return Math.round(avg);
}
