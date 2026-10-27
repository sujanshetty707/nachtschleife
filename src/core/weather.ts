/**
 * Dynamic Weather System
 * Manages rain intensity, fog density, lightning bursts, and wetness shaders
 * across the circuit sectors.
 */

import * as THREE from 'three';
import { getScene } from './renderer.ts';
import { setRainIntensity, triggerThunder } from './audio.ts';
import { qualityConfig } from './quality.ts';

export interface WeatherState {
  rainIntensity: number;   // 0 = dry, 1 = maximum storm
  fogDensity: number;      // FogExp2 density
  fogColor: THREE.Color;
  lightningActive: boolean;
  wetness: number;         // Road reflection roughness factor
}

let sceneFog: THREE.FogExp2;
let lightningLight: THREE.DirectionalLight;
let lastLightningTime = 0;
const MIN_LIGHTNING_INTERVAL = 4.5; // WCAG safe interval: max 1 burst every 4.5s

export const currentWeather: WeatherState = {
  rainIntensity: 0.3,
  fogDensity: 0.008,
  fogColor: new THREE.Color(0x050508),
  lightningActive: false,
  wetness: 0.9,
};

export function initWeather(): void {
  const scene = getScene();

  sceneFog = new THREE.FogExp2(0x050508, 0.008);
  scene.fog = sceneFog;

  lightningLight = new THREE.DirectionalLight(0xb0d8ff, 0);
  lightningLight.position.set(20, 150, 40);
  scene.add(lightningLight);
}

/** Update weather parameters according to spline lap progress t (0..1) */
export function updateWeatherByProgress(t: number): void {
  // Sector 0.00 - 0.25 (Start to Schwedenkreuz): Light drizzle
  // Sector 0.25 - 0.55 (Fuchsröhre to Bergwerk): Deep forest valley mist
  // Sector 0.65 - 0.78 (Karussell to Hohe Acht summit): Severe mountain thunderstorm
  // Sector 0.78 - 0.92 (Brünnchen to Pflanzgarten): Tapering rain
  // Sector 0.92 - 1.00 (Döttinger Höhe to Finish): Clearing, first light

  if (t < 0.25) {
    currentWeather.rainIntensity = 0.25 + (t / 0.25) * 0.2;
    currentWeather.fogDensity = 0.008;
    currentWeather.fogColor.setHex(0x050508);
  } else if (t < 0.60) {
    // Valley descent: thick fog
    const progress = (t - 0.25) / 0.35;
    currentWeather.rainIntensity = 0.45 + progress * 0.25;
    currentWeather.fogDensity = 0.012 + progress * 0.008;
    currentWeather.fogColor.setHex(0x04060b);
  } else if (t < 0.80) {
    // Hohe Acht summit: extreme thunderstorm
    currentWeather.rainIntensity = 0.95;
    currentWeather.fogDensity = 0.018;
    currentWeather.fogColor.setHex(0x060814);

    // Random lightning check (throttled for accessibility)
    const now = performance.now() / 1000;
    if (now - lastLightningTime > MIN_LIGHTNING_INTERVAL && Math.random() < 0.02) {
      triggerLightningStrike();
      lastLightningTime = now;
    }
  } else if (t < 0.94) {
    // Pflanzgarten: easing storm
    const progress = (t - 0.80) / 0.14;
    currentWeather.rainIntensity = 0.8 - progress * 0.5;
    currentWeather.fogDensity = 0.014 - progress * 0.006;
  } else {
    // Döttinger straight & dawn finish: break in the clouds
    const progress = (t - 0.94) / 0.06;
    currentWeather.rainIntensity = 0.25 * (1 - progress);
    currentWeather.fogDensity = 0.006;
    // Horizon warms slightly toward dawn twilight
    currentWeather.fogColor.setRGB(
      0.05 + progress * 0.08,
      0.06 + progress * 0.05,
      0.10 + progress * 0.08
    );
  }

  // Sync to Three.js fog
  if (sceneFog) {
    sceneFog.density = currentWeather.fogDensity;
    sceneFog.color.copy(currentWeather.fogColor);
  }

  // Sync to audio rain synthesis
  setRainIntensity(currentWeather.rainIntensity);
}

/** Trigger realistic double-strike lightning flash */
export function triggerLightningStrike(): void {
  if (!lightningLight) return;

  currentWeather.lightningActive = true;
  triggerThunder(0.85 + Math.random() * 0.3);

  // Quick double pulse (flash 1 -> dip -> flash 2 -> fade)
  lightningLight.intensity = 6.0;
  if (sceneFog) sceneFog.color.setHex(0x2a3860);

  setTimeout(() => {
    if (lightningLight) lightningLight.intensity = 1.2;
    setTimeout(() => {
      if (lightningLight) lightningLight.intensity = 4.5;
      setTimeout(() => {
        if (lightningLight) lightningLight.intensity = 0;
        if (sceneFog) sceneFog.color.copy(currentWeather.fogColor);
        currentWeather.lightningActive = false;
      }, 120);
    }, 60);
  }, 70);
}
