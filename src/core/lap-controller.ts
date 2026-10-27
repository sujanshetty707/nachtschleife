/**
 * Nordschleife Lap Controller & Chapter Camera Choreographer
 * Synchronizes the 3D car position along the 20.8 km spline,
 * choreographs dynamic cinematic camera angles per sector,
 * and feeds telemetry to the HUD and audio engine.
 */

import * as THREE from 'three';
import { getScene, getCamera } from './renderer.ts';
import { buildNordschleifeTrack, type TrackRig } from '../utils/track-builder.ts';
import { createProxyCar, type ProxyCarRig } from '../utils/proxy-car.ts';
import { updateWeatherByProgress, currentWeather, initWeather } from './weather.ts';
import { updateHUD } from '../ui/hud.ts';
import { updateNavProgress } from '../ui/nav.ts';
import { scrollState } from './scroll.ts';
import { lerp } from '../utils/math.ts';

let trackRig: TrackRig | null = null;
let carRig: ProxyCarRig | null = null;
let trackLights: THREE.SpotLight[] = [];

// Camera smoothing targets
const currentCamPos = new THREE.Vector3(0, 2.5, 9);
const targetCamPos = new THREE.Vector3();
const currentLookAt = new THREE.Vector3(0, 0.8, 0);
const targetLookAt = new THREE.Vector3();

// Dynamic headlight beams
let headlightLeft: THREE.SpotLight;
let headlightRight: THREE.SpotLight;

export function initLapController(): void {
  const scene = getScene();
  const camera = getCamera();

  // 0. Initialize dynamic weather & lightning system
  initWeather();

  // 1. Build and add 3D Nordschleife track geometry
  trackRig = buildNordschleifeTrack();
  scene.add(trackRig.roadMesh);
  scene.add(trackRig.kerbGroup);
  scene.add(trackRig.barrierGroup);
  scene.add(trackRig.trees);
  trackRig.marshalLights.forEach(light => scene.add(light));

  // 2. Instantiate and add the LMP/GTP prototype car
  carRig = createProxyCar();
  scene.add(carRig.root);

  // 3. Attach powerful LED projector headlights to car
  headlightLeft = new THREE.SpotLight(0xe8f0ff, 12, 55, 0.22, 0.35);
  headlightLeft.position.set(0.45, 0.55, 2.5);
  headlightLeft.target = carRig.headlightTargets[0]!;
  carRig.root.add(headlightLeft);
  carRig.root.add(headlightLeft.target);

  headlightRight = new THREE.SpotLight(0xe8f0ff, 12, 55, 0.22, 0.35);
  headlightRight.position.set(-0.45, 0.55, 2.5);
  headlightRight.target = carRig.headlightTargets[1]!;
  carRig.root.add(headlightRight);
  carRig.root.add(headlightRight.target);

  // 4. Rear red brake/rain light
  const rearRainLight = new THREE.PointLight(0xff1100, 3, 6);
  rearRainLight.position.set(0, 0.55, -2.4);
  carRig.root.add(rearRainLight);

  // 5. Initial camera position
  camera.position.set(0, 2.5, 9);
  camera.lookAt(0, 0.8, 0);
}

/** Update car transform, camera choreography, weather, and telemetry every frame */
export function updateLapController(dt: number, scrollProgress: number, velocity: number): void {
  if (!trackRig || !carRig) return;

  const scene = getScene();
  const camera = getCamera();

  // Normalize spline progress 0..1
  const t = ((scrollProgress % 1) + 1) % 1;

  // 1. Query track spline position, tangent, normal, and banking
  const frame = trackRig.getTransformAt(t);

  // Position car precisely on track centerline
  carRig.root.position.copy(frame.position);

  // Orient car forward along spline tangent with banking tilt
  const forward = frame.tangent.clone();
  const up = frame.normal.clone();
  const side = new THREE.Vector3().crossVectors(forward, up).normalize();

  const rotMatrix = new THREE.Matrix4().makeBasis(side, up, forward);
  carRig.root.quaternion.setFromRotationMatrix(rotMatrix);

  // Spring physics & wheel spin driven by carRig.update
  carRig.update(dt, velocity * 20 + 8, frame.banking * 2.0);

  // 2. Dynamic Camera Choreography per sector
  // Different corners use distinct cinematic perspectives:
  // - Hero (t < 0.08): Orbiting showcase dolly
  // - Hatzenbach (t 0.08..0.16): Chase cam hugging rear deck
  // - Flugplatz (t 0.16..0.24): Low-angle kerb-cam watching suspension jump
  // - Fuchsröhre (t 0.24..0.36): High-angle dive cam tracking steep plunge
  // - Karussell (t 0.60..0.70): Cockpit tilt camera leaning into the 33° concrete banking
  // - Hohe Acht (t 0.70..0.80): Helicopter storm tracker buffeted by wind
  // - Döttinger Höhe (t 0.92..0.98): Low-slung front bumper cam at 340 km/h warp speed
  // - Finish (t 0.98..1.00): Grandstand panning shot into dawn

  if (t < 0.08) {
    // Hero: Smooth orbiting around car
    const angle = t * Math.PI * 4;
    targetCamPos.set(
      frame.position.x + Math.sin(angle) * 7.5,
      frame.position.y + 2.0,
      frame.position.z + Math.cos(angle) * 7.5
    );
    targetLookAt.copy(frame.position).add(new THREE.Vector3(0, 0.8, 0));
  } else if (t >= 0.16 && t < 0.24) {
    // Flugplatz: Low track-side jump cam
    const sideOffset = side.clone().multiplyScalar(4.5);
    targetCamPos.copy(frame.position).add(sideOffset).add(new THREE.Vector3(0, 0.4, 0));
    targetLookAt.copy(frame.position).add(new THREE.Vector3(0, 0.9, 0));
  } else if (t >= 0.24 && t < 0.36) {
    // Fuchsröhre: Steep descent chase cam
    const backOffset = forward.clone().multiplyScalar(-9);
    targetCamPos.copy(frame.position).add(backOffset).add(new THREE.Vector3(0, 3.8, 0));
    targetLookAt.copy(frame.position).add(forward.clone().multiplyScalar(15));
  } else if (t >= 0.60 && t < 0.70) {
    // Karussell: Tilted banking cockpit follow
    const backOffset = forward.clone().multiplyScalar(-5);
    targetCamPos.copy(frame.position).add(backOffset).add(up.clone().multiplyScalar(1.6));
    targetLookAt.copy(frame.position).add(forward.clone().multiplyScalar(12));
  } else if (t >= 0.70 && t < 0.80) {
    // Hohe Acht: High storm drone cam
    const windJitter = (Math.random() - 0.5) * 0.3 * currentWeather.rainIntensity;
    targetCamPos.copy(frame.position).add(new THREE.Vector3(windJitter, 8.5, windJitter - 8));
    targetLookAt.copy(frame.position);
  } else if (t >= 0.92 && t < 0.98) {
    // Döttinger Höhe: Ultra-low high speed chase
    const backOffset = forward.clone().multiplyScalar(-6.5);
    targetCamPos.copy(frame.position).add(backOffset).add(new THREE.Vector3(0, 1.2, 0));
    targetLookAt.copy(frame.position).add(forward.clone().multiplyScalar(25));
  } else {
    // Standard fluid chase cam
    const backOffset = forward.clone().multiplyScalar(-7.5);
    targetCamPos.copy(frame.position).add(backOffset).add(new THREE.Vector3(0, 2.2, 0));
    targetLookAt.copy(frame.position).add(new THREE.Vector3(0, 0.9, 0));
  }

  // Smooth camera interpolation (spring-like responsiveness)
  currentCamPos.lerp(targetCamPos, Math.min(1.0, dt * 6.5));
  currentLookAt.lerp(targetLookAt, Math.min(1.0, dt * 7.5));

  camera.position.copy(currentCamPos);
  camera.lookAt(currentLookAt);

  // 3. Update Weather System (rain, fog, lightning)
  updateWeatherByProgress(t);

  // 4. Update Live Telemetry HUD and Top Navigation bar
  updateHUD(t, velocity, currentWeather.rainIntensity);
  updateNavProgress(scrollProgress);

  // 5. Marshal light strobe animation
  if (trackRig.marshalLights.length > 0) {
    const flash = (Math.sin(performance.now() * 0.008) > 0) ? 2.5 : 0.0;
    trackRig.marshalLights.forEach(light => {
      light.intensity = flash;
    });
  }
}
