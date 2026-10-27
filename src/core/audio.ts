/**
 * Audio System Coordinator
 * Manages Web Audio context, unlocks on user gesture, coordinates rain, engine,
 * thunder, and radio layers.
 */

import { RainAudio } from '../audio/rain.ts';
import { EngineAudio } from '../audio/engine.ts';
import { ThunderAudio } from '../audio/thunder.ts';
import { RadioAudio } from '../audio/radio.ts';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let rain: RainAudio | null = null;
let engine: EngineAudio | null = null;
let thunder: ThunderAudio | null = null;
let radio: RadioAudio | null = null;

let isMuted = true;
let isInitialized = false;

export function initAudio(): void {
  if (isInitialized) return;

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    console.warn('Web Audio API not supported in this browser');
    return;
  }

  audioCtx = new AudioContextClass();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8;
  masterGain.connect(audioCtx.destination);

  rain = new RainAudio(audioCtx, masterGain);
  engine = new EngineAudio(audioCtx, masterGain);
  thunder = new ThunderAudio(audioCtx, masterGain);
  radio = new RadioAudio(audioCtx, masterGain);

  isInitialized = true;
}

/** Called when the user clicks 'Enable sound' or sound button */
export async function enableAudio(): Promise<boolean> {
  if (!isInitialized) {
    initAudio();
  }

  if (!audioCtx) return false;

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  isMuted = false;
  rain?.start();
  engine?.start();

  updateSoundButtonUI(true);
  return true;
}

export function disableAudio(): void {
  isMuted = true;
  rain?.stop();
  engine?.stop();
  updateSoundButtonUI(false);
}

export function toggleAudio(): boolean {
  if (isMuted) {
    enableAudio();
    return true;
  } else {
    disableAudio();
    return false;
  }
}

export function isAudioEnabled(): boolean {
  return !isMuted;
}

/** Update engine RPM and pitch based on scroll speed */
export function updateAudioVelocity(velocity: number): void {
  if (isMuted || !engine) return;
  engine.setThrottle(velocity);
}

/** Set rain storm intensity (0..1) */
export function setRainIntensity(intensity: number): void {
  if (isMuted || !rain) return;
  rain.setIntensity(intensity);
}

/** Trigger thunder crack with optional intensity */
export function triggerThunder(intensity = 1.0): void {
  if (isMuted || !thunder) return;
  thunder.trigger(intensity);
}

/** Trigger pit radio notification */
export function triggerRadioBeep(): void {
  if (isMuted || !radio) return;
  radio.playRogerBeep();
}

function updateSoundButtonUI(enabled: boolean): void {
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.innerHTML = `<span aria-hidden="true">${enabled ? '🔊' : '🔇'}</span> Sound ${enabled ? 'ON' : 'OFF'}`;
  }
}
