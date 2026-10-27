// ─── Types ───────────────────────────────────────────────────────────────────
export type QualityTier = 'ultra' | 'high' | 'low';

export interface QualityConfig {
  tier: QualityTier;
  dpr: number;
  shadowMapSize: number;
  rainParticles: number;
  volumetrics: boolean;
  ssrEnabled: boolean;
  dofEnabled: boolean;
  motionBlurEnabled: boolean;
  fogQuality: 'full' | 'light' | 'fake';
}

export interface ChapterModule {
  id: string;
  label: string;
  init(scene: import('three').Scene, camera: import('three').Camera): void;
  enter(): void;
  exit(): void;
  update(dt: number, scrollProgress: number, scrollVelocity: number): void;
  dispose(): void;
}

export interface RouteModule {
  path: string;
  enter(): Promise<void>;
  exit(): Promise<void>;
}

export interface ScrollState {
  progress: number;      // 0–1 overall scroll
  velocity: number;      // pixels/sec, signed
  chapter: number;       // 0–11
  chapterProgress: number; // 0–1 within chapter
}

export interface AudioLayer {
  gainNode: GainNode;
  setGain(value: number, rampTime?: number): void;
  start(): void;
  stop(): void;
}
