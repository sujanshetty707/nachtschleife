/**
 * Chapter 01 — Start/Finish (Hero)
 *
 * The car on the wet pit straight under floodlights.
 * Title assembles from sparks.
 * Scroll dollies and orbits the camera around the car.
 * Light rain begins.
 *
 * Verified: Nürburgring Nordschleife pit straight is on the south side of the circuit,
 * with floodlight masts along the pit wall. (Source: nürburgring.de circuit guide)
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getScene, getCamera } from '../core/renderer.ts';
import { createProxyCar } from '../utils/proxy-car.ts';
import { lerp, clamp } from '../utils/math.ts';
import type { ProxyCarRig } from '../utils/proxy-car.ts';

// ─── Scene objects ─────────────────────────────────────────────────────────
let carRig: ProxyCarRig;
let roadMesh: THREE.Mesh;
let floodlights: THREE.SpotLight[] = [];
let rainParticles: THREE.Points;
let headlightLeft: THREE.SpotLight;
let headlightRight: THREE.SpotLight;
let cameraOrbitTarget = new THREE.Vector3(0, 0.8, 0);

// Camera orbit state
let cameraTheta = 0;   // horizontal angle
let cameraPhi = 0.25;  // vertical angle
let cameraRadius = 7;
let cameraOrbitProgress = 0; // 0 = dolly in, 1 = full orbit

// Scroll state
let scrollProgress = 0;
let lastScrollProgress = 0;

// Rain
const RAIN_COUNT_HIGH = 3000;
const RAIN_COUNT_LOW = 500;

export function initChapter01(): void {
  const scene = getScene();
  const camera = getCamera();

  // ─── Road plane (wet asphalt) ─────────────────────────────────────────
  const roadGeo = new THREE.PlaneGeometry(12, 80, 4, 4);
  const roadMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d0e14,
    roughness: 0.12,
    metalness: 0.0,
    reflectivity: 0.8,
    envMapIntensity: 1.5,
  });
  roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  // Road lane markings (emissive white lines)
  const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
  for (let i = -1; i <= 1; i += 2) {
    for (let j = 0; j < 8; j++) {
      const mGeo = new THREE.PlaneGeometry(0.08, 2.5);
      const marking = new THREE.Mesh(mGeo, markingMat);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(i * 1.8, 0.001, j * 8 - 28);
      scene.add(marking);
    }
  }

  // Kerb stripes (red and white alternating)
  const kerbColors = [0xff2200, 0xffffff];
  for (let i = 0; i < 20; i++) {
    const kerbGeo = new THREE.BoxGeometry(0.5, 0.04, 1.5);
    const kerbMat = new THREE.MeshStandardMaterial({
      color: kerbColors[i % 2],
      roughness: 0.6,
    });
    const kerbL = new THREE.Mesh(kerbGeo, kerbMat);
    kerbL.position.set(6.25, 0.02, i * 1.5 - 15);
    scene.add(kerbL);

    const kerbR = new THREE.Mesh(kerbGeo, kerbMat);
    kerbR.position.set(-6.25, 0.02, i * 1.5 - 15);
    scene.add(kerbR);
  }

  // ─── Proxy car ───────────────────────────────────────────────────────
  carRig = createProxyCar();
  carRig.root.position.set(0, 0, 0);
  scene.add(carRig.root);

  // ─── Headlights ──────────────────────────────────────────────────────
  headlightLeft = new THREE.SpotLight(0xe8f0ff, 8, 35, 0.18, 0.4);
  headlightLeft.position.set(0.45, 0.55, 2.5);
  headlightLeft.target = carRig.headlightTargets[0]!;
  headlightLeft.castShadow = false; // too expensive for headlight
  scene.add(headlightLeft, headlightLeft.target);

  headlightRight = new THREE.SpotLight(0xe8f0ff, 8, 35, 0.18, 0.4);
  headlightRight.position.set(-0.45, 0.55, 2.5);
  headlightRight.target = carRig.headlightTargets[1]!;
  scene.add(headlightRight, headlightRight.target);

  // Rear red light
  const rearLight = new THREE.PointLight(0xff0000, 2, 4);
  rearLight.position.set(0, 0.55, -2.4);
  carRig.root.add(rearLight);

  // Brake disc warm glow (subtle orange under chassis)
  const brakeGlowL = new THREE.PointLight(0xff4400, 0.5, 1.2);
  brakeGlowL.position.set(0.93, 0.32, -1.65);
  carRig.root.add(brakeGlowL);
  const brakeGlowR = new THREE.PointLight(0xff4400, 0.5, 1.2);
  brakeGlowR.position.set(-0.93, 0.32, -1.65);
  carRig.root.add(brakeGlowR);

  // ─── Floodlight masts ────────────────────────────────────────────────
  const mastPositions: [number, number][] = [
    [8, -20], [-8, -20], [8, 0], [-8, 0], [8, 20], [-8, 20]
  ];
  mastPositions.forEach(([x, z]) => {
    // Mast pole
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 14, 6);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(x, 7, z);
    scene.add(mast);

    // Lamp head
    const lampGeo = new THREE.BoxGeometry(1.2, 0.3, 0.5);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0xe8f0ff, emissiveIntensity: 2 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x, 14, z);
    scene.add(lamp);

    // SpotLight from mast
    const floodlight = new THREE.SpotLight(0xd0d8f8, 5, 30, 0.6, 0.6);
    floodlight.position.set(x, 14, z);
    floodlight.target.position.set(0, 0, z);
    floodlight.castShadow = true;
    floodlight.shadow.mapSize.width = 512;
    floodlight.shadow.mapSize.height = 512;
    scene.add(floodlight, floodlight.target);
    floodlights.push(floodlight);
  });

  // ─── Ambient / hemisphere light (night sky) ───────────────────────────
  const hemi = new THREE.HemisphereLight(0x101520, 0x050508, 0.3);
  scene.add(hemi);

  // Warm halogen rim light from pit wall
  const rimLight = new THREE.DirectionalLight(0xffd060, 0.8);
  rimLight.position.set(-10, 5, -5);
  scene.add(rimLight);

  // ─── Rain particles ───────────────────────────────────────────────────
  rainParticles = createRainParticles();
  scene.add(rainParticles);

  // ─── Camera initial position ──────────────────────────────────────────
  camera.position.set(0, 2.5, 9);
  camera.lookAt(cameraOrbitTarget);

  // ─── GSAP ScrollTrigger ───────────────────────────────────────────────
  ScrollTrigger.create({
    trigger: '#main-content',
    start: 'top top',
    end: '+=800%',
    scrub: 1,
    onUpdate: (self) => {
      scrollProgress = self.progress;
    },
  });

  // ─── Title spark assembly ─────────────────────────────────────────────
  // (DOM text, animated after loader)
  spawnTitle();

  // ─── Tab flag + favicon easter egg hook ──────────────────────────────
  initFlagTabUpdate();
}

function createRainParticles(): THREE.Points {
  const count = RAIN_COUNT_HIGH;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    velocities[i] = 8 + Math.random() * 6;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xa0b8d8,
    size: 0.04,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
  });

  return new THREE.Points(geo, mat);
}

function updateRain(dt: number): void {
  const pos = rainParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
  const vel = rainParticles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const velArr = vel.array as Float32Array;
  const count = pos.count;

  for (let i = 0; i < count; i++) {
    const yIdx = i * 3 + 1;
    const v = velArr[i] ?? 10;
    arr[yIdx] = (arr[yIdx] ?? 0) - v * dt;
    if ((arr[yIdx] ?? 0) < -0.5) {
      arr[yIdx] = 20;
    }
  }
  pos.needsUpdate = true;
}

function spawnTitle(): void {
  // Create DOM overlay for the title — kept in DOM for SEO/accessibility
  const titleEl = document.createElement('div');
  titleEl.id = 'hero-title';
  titleEl.setAttribute('aria-label', 'NACHTSCHLEIFE');
  titleEl.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-display);
    font-size: clamp(3rem, 10vw, 9rem);
    font-weight: 900;
    color: #f0f0f8;
    letter-spacing: -0.02em;
    text-align: center;
    pointer-events: none;
    z-index: 10;
    mix-blend-mode: screen;
    opacity: 0;
    text-shadow: 0 0 40px rgba(232,240,255,0.3), 0 0 80px rgba(100,150,255,0.15);
  `;

  // DOM text is the accessible label; visual letters are split for animation
  const letters = 'NACHTSCHLEIFE'.split('');
  letters.forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.cssText = `
      display: inline-block;
      opacity: 0;
      transform: translate(${(Math.random()-0.5)*200}px, ${(Math.random()-0.5)*200}px) scale(${Math.random()*2+0.5});
      filter: brightness(3);
      transition: none;
    `;
    span.setAttribute('aria-hidden', 'true');
    titleEl.appendChild(span);
  });

  // Actual accessible text (hidden visually, present in DOM)
  const srText = document.createElement('span');
  srText.textContent = 'NACHTSCHLEIFE';
  srText.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
  titleEl.appendChild(srText);

  document.body.appendChild(titleEl);

  // Animate in after 200ms delay (boot just finished)
  setTimeout(() => {
    titleEl.style.opacity = '1';

    const spans = titleEl.querySelectorAll('span[aria-hidden]');
    spans.forEach((span, i) => {
      gsap.to(span, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'brightness(1)',
        duration: 0.8 + Math.random() * 0.4,
        delay: i * 0.06,
        ease: 'power3.out',
      });
    });
  }, 300);

  // Scroll drives title out
  ScrollTrigger.create({
    trigger: '#main-content',
    start: 'top top',
    end: '+=300%',
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(titleEl, {
        opacity: 1 - self.progress * 3,
        y: -self.progress * 200,
      });
    },
  });
}

function initFlagTabUpdate(): void {
  // Easter egg 6: tab title and data-flag follow scroll progress
  ScrollTrigger.create({
    trigger: '#main-content',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      let flag: string;
      let title: string;

      if (p < 0.05) { flag = 'green'; title = 'NACHTSCHLEIFE — Green flag'; }
      else if (p < 0.5) { flag = 'green'; title = 'NACHTSCHLEIFE — On lap'; }
      else if (p < 0.6) { flag = 'yellow'; title = 'NACHTSCHLEIFE — Safety car'; }
      else if (p < 0.85) { flag = 'green'; title = 'NACHTSCHLEIFE — Push now'; }
      else if (p > 0.95) { flag = 'chequered'; title = 'NACHTSCHLEIFE — Lap complete ✓'; }
      else { flag = 'green'; title = 'NACHTSCHLEIFE — Final lap'; }

      document.documentElement.setAttribute('data-flag', flag);
      document.title = title;
    },
  });
}

export function updateChapter01(dt: number, scrollVelocity: number): void {
  // Animate rain
  updateRain(dt);

  // Camera orbit driven by scroll
  const orbitAmount = clamp(scrollProgress * 3, 0, 1);
  cameraTheta = orbitAmount * Math.PI * 0.8;
  cameraRadius = lerp(8, 5, orbitAmount);
  const camY = lerp(2.5, 1.5, orbitAmount);

  const camera = getCamera();
  camera.position.x = Math.sin(cameraTheta) * cameraRadius;
  camera.position.z = Math.cos(cameraTheta) * cameraRadius;
  camera.position.y = camY;
  camera.lookAt(cameraOrbitTarget);

  // Car animation (stationary in hero, slight idle motion)
  const time = performance.now() * 0.001;
  carRig.root.position.y = Math.sin(time * 0.8) * 0.008;
  carRig.update(dt, 0, 0);

  // Scroll-velocity → chromatic aberration
  // (will be wired to postprocessing effect in next pass)
  const velNorm = clamp(Math.abs(scrollVelocity) / 2000, 0, 1);
  // TODO: wire to chromaticAberrationEffect.offset when import resolves

  // Floodlight flicker (very subtle)
  floodlights.forEach((light, i) => {
    light.intensity = 5 + Math.sin(time * 2.3 + i) * 0.15;
  });

  // Headlights follow mouse (easter egg / interaction)
  // (cursor position dispatched from cursor.ts)
}
