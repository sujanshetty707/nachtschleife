/**
 * Live Endurance Racing & Code Telemetry HUD
 * Tracks speed, gear, RPM, sector delta, tyre temps, and lap timer.
 */

import { TRACK_SECTORS } from '../utils/track-builder.ts';

export interface TelemetryData {
  speed: number;       // km/h
  gear: number;        // 1..7
  rpm: number;         // 1800..8800
  sector: string;
  lapTime: string;
  tyreTemp: number;    // °C
  rainGauge: number;   // %
  delta: string;       // +/- against 5:19.546
}

let lapStartTime = 0;
let hudContainer: HTMLElement | null = null;
let speedEl: HTMLElement | null = null;
let gearEl: HTMLElement | null = null;
let rpmBarEl: HTMLElement | null = null;
let sectorEl: HTMLElement | null = null;
let lapTimeEl: HTMLElement | null = null;
let deltaEl: HTMLElement | null = null;
let rainEl: HTMLElement | null = null;
let tyreEl: HTMLElement | null = null;

export function initHUD(): void {
  lapStartTime = performance.now();

  hudContainer = document.getElementById('telemetry-hud');
  if (!hudContainer) {
    hudContainer = document.createElement('div');
    hudContainer.id = 'telemetry-hud';
    hudContainer.innerHTML = `
      <div class="hud-sector-card">
        <span class="hud-label">CURRENT SECTOR</span>
        <span id="hud-sector-name" class="hud-val">START / FINISH</span>
        <div class="hud-delta"><span id="hud-delta-val">-0.428s</span> VS TIMO 5:19.546</div>
      </div>

      <div class="hud-center-cluster">
        <div class="hud-gear-box">
          <span class="hud-label">GEAR</span>
          <span id="hud-gear-val" class="hud-gear">3</span>
        </div>
        <div class="hud-speed-box">
          <span id="hud-speed-val" class="hud-speed">142</span>
          <span class="hud-unit">KM/H</span>
        </div>
        <div class="hud-rpm-wrapper">
          <div id="hud-rpm-bar" class="hud-rpm-fill"></div>
        </div>
      </div>

      <div class="hud-telemetry-stats">
        <div class="hud-stat-item">
          <span class="hud-label">LAP TIME</span>
          <span id="hud-lap-time" class="hud-mono">00:00.000</span>
        </div>
        <div class="hud-stat-item">
          <span class="hud-label">TYRES (AVG)</span>
          <span id="hud-tyre-temp" class="hud-mono">78°C WET</span>
        </div>
        <div class="hud-stat-item">
          <span class="hud-label">PRECIPITATION</span>
          <span id="hud-rain-gauge" class="hud-mono">35%</span>
        </div>
      </div>
    `;
    document.body.appendChild(hudContainer);
  }

  speedEl = document.getElementById('hud-speed-val');
  gearEl = document.getElementById('hud-gear-val');
  rpmBarEl = document.getElementById('hud-rpm-bar');
  sectorEl = document.getElementById('hud-sector-name');
  lapTimeEl = document.getElementById('hud-lap-time');
  deltaEl = document.getElementById('hud-delta-val');
  rainEl = document.getElementById('hud-rain-gauge');
  tyreEl = document.getElementById('hud-tyre-temp');
}

/** Update HUD metrics based on spline progress t (0..1) and scroll velocity */
export function updateHUD(progress: number, velocity: number, rainIntensity: number): void {
  if (!speedEl) return;

  const absV = Math.abs(velocity);
  const normalizedT = ((progress % 1) + 1) % 1;

  // Determine current sector
  let currentSector = TRACK_SECTORS[0]!;
  for (let i = TRACK_SECTORS.length - 1; i >= 0; i--) {
    if (normalizedT >= TRACK_SECTORS[i]!.t - 0.02) {
      currentSector = TRACK_SECTORS[i]!;
      break;
    }
  }

  // Calculate speed based on sector characteristics & velocity
  let baseSectorSpeed = 160;
  if (currentSector.name === 'Döttinger Höhe') {
    baseSectorSpeed = 310;
  } else if (currentSector.name === 'Fuchsröhre') {
    baseSectorSpeed = 265;
  } else if (currentSector.name === 'Flugplatz') {
    baseSectorSpeed = 245;
  } else if (currentSector.name === 'Karussell' || currentSector.name === 'Breidscheid') {
    baseSectorSpeed = 95;
  }

  // Speed scales with velocity
  const speed = Math.round(Math.max(45, Math.min(345, baseSectorSpeed + absV * 25)));
  speedEl.textContent = String(speed);

  // Compute gear from speed
  let gear = 1;
  if (speed > 280) gear = 7;
  else if (speed > 230) gear = 6;
  else if (speed > 185) gear = 5;
  else if (speed > 140) gear = 4;
  else if (speed > 95) gear = 3;
  else if (speed > 60) gear = 2;
  if (gearEl) gearEl.textContent = String(gear);

  // RPM calculation (1800 to 8800)
  const rpmRatio = ((speed % 50) + 10) / 60;
  const rpm = Math.round(3500 + rpmRatio * 4800);
  if (rpmBarEl) {
    const rpmPercent = Math.min(100, (rpm / 8800) * 100);
    rpmBarEl.style.width = `${rpmPercent}%`;
    if (rpm > 8200) {
      rpmBarEl.style.background = '#e8002d'; // redline
    } else if (rpm > 7000) {
      rpmBarEl.style.background = '#0090ff';
    } else {
      rpmBarEl.style.background = '#00d26a';
    }
  }

  // Update Sector Name
  if (sectorEl) sectorEl.textContent = currentSector.name.toUpperCase();

  // Simulated Lap Timer based on progress through the 5:19.546 target
  const totalTargetSecs = 319.546;
  const currentLapSecs = normalizedT * totalTargetSecs;
  const mins = Math.floor(currentLapSecs / 60);
  const secs = Math.floor(currentLapSecs % 60);
  const millis = Math.floor((currentLapSecs * 1000) % 1000);
  if (lapTimeEl) {
    lapTimeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  // Delta calculation (+/- against record)
  if (deltaEl) {
    const delta = (normalizedT * -0.85).toFixed(3);
    deltaEl.textContent = `${delta}s`;
  }

  // Tyre temp & Rain
  if (rainEl) {
    rainEl.textContent = `${Math.round(rainIntensity * 100)}%`;
  }
  if (tyreEl) {
    const temp = Math.round(72 + normalizedT * 18 + absV * 2);
    tyreEl.textContent = `${temp}°C WET`;
  }
}
