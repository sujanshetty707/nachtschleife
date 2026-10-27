/**
 * Math utilities: spring physics, interpolation, remapping.
 */

/** Linear interpolation */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Clamp value between min and max */
export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Remap value from one range to another */
export const remap = (v: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const t = (v - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
};

/** Smooth step (cubic Hermite) */
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Exponential decay (dt-independent lerp) — preferred over lerp for per-frame blending */
export const expDecay = (a: number, b: number, decay: number, dt: number): number =>
  b + (a - b) * Math.exp(-decay * dt);

/** Simple spring step — call once per frame */
export function springStep(
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number
): [value: number, velocity: number] {
  const force = (target - value) * stiffness - velocity * damping;
  const newVelocity = velocity + force * dt;
  const newValue = value + newVelocity * dt;
  return [newValue, newVelocity];
}

/** Modulo that returns positive results */
export const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Convert degrees to radians */
export const degToRad = (d: number): number => (d * Math.PI) / 180;

/** Format lap time from seconds: M:SS.mmm */
export function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(3).padStart(6, '0')}`;
}
