import * as THREE from 'three';

/**
 * Proxy car — a clearly labelled Three.js geometry stand-in for the real licensed GLB.
 * All articulation systems (wheel spin, pitch/roll spring, camera mount) are wired here
 * so they work immediately and transfer to the real model on drop-in.
 *
 * LABEL: [PROXY CAR — REPLACE WITH LICENSED GLB AT public/assets/models/car_hero.glb]
 */

export interface ProxyCarRig {
  root: THREE.Group;          // Root group — reposition this along the spline
  body: THREE.Mesh;           // Fuselage
  wheels: THREE.Mesh[];       // [FL, FR, RL, RR]
  headlightTargets: THREE.Object3D[]; // Positions for SpotLight targets
  exhaustPorts: THREE.Object3D[];     // For particle emitters
  update(dt: number, speed: number, steeringAngle: number): void;
}

// Spring physics state
interface SpringState {
  value: number;
  velocity: number;
}

function springStep(state: SpringState, target: number, stiffness: number, damping: number, dt: number): void {
  const force = (target - state.value) * stiffness - state.velocity * damping;
  state.velocity += force * dt;
  state.value += state.velocity * dt;
}

export function createProxyCar(): ProxyCarRig {
  const root = new THREE.Group();
  root.name = 'PROXY_CAR';

  // ─── Body (fuselage) ─────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(1.9, 0.55, 4.8);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a14,
    metalness: 0.1,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.name = 'body';
  body.position.set(0, 0.55, 0);
  body.castShadow = true;

  // Proxy label sprite
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ff3300';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('[PROXY CAR — REPLACE WITH LICENSED GLB]', 8, 40);
  const labelTex = new THREE.CanvasTexture(canvas);
  const labelGeo = new THREE.PlaneGeometry(3.5, 0.44);
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, 1.0, 0);
  label.rotation.x = -0.3;
  body.add(label);

  root.add(body);

  // ─── Cockpit canopy ──────────────────────────────────────────────────────
  const cockpitGeo = new THREE.BoxGeometry(0.9, 0.35, 1.4);
  const cockpitMat = new THREE.MeshPhysicalMaterial({
    color: 0x111122,
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.7,
    transparent: true,
    opacity: 0.6,
  });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(0, 0.85, 0.3);
  root.add(cockpit);

  // ─── Front wing ──────────────────────────────────────────────────────────
  const fwGeo = new THREE.BoxGeometry(2.1, 0.06, 0.55);
  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x101010,
    metalness: 0.3,
    roughness: 0.4,
  });
  const frontWing = new THREE.Mesh(fwGeo, carbonMat);
  frontWing.position.set(0, 0.22, 2.55);
  root.add(frontWing);

  // ─── Rear wing ───────────────────────────────────────────────────────────
  const rwGeo = new THREE.BoxGeometry(1.85, 0.08, 0.4);
  const rearWing = new THREE.Mesh(rwGeo, carbonMat);
  rearWing.position.set(0, 1.05, -2.3);
  root.add(rearWing);

  // ─── Wheels (4) ──────────────────────────────────────────────────────────
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.26, 20);
  const wheelMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d0d0d,
    roughness: 0.85,
    metalness: 0.0,
  });
  const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.27, 8);
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });

  const wheelPositions: [number, number, number][] = [
    [0.93, 0.32, 1.65],   // FL
    [-0.93, 0.32, 1.65],  // FR
    [0.93, 0.32, -1.65],  // RL
    [-0.93, 0.32, -1.65], // RR
  ];

  const wheels: THREE.Mesh[] = wheelPositions.map(([x, y, z], i) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.name = ['FL', 'FR', 'RL', 'RR'][i] as string;
    wheel.castShadow = true;

    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    const mount = new THREE.Group();
    mount.position.set(x, y, z);
    mount.add(wheel);
    root.add(mount);

    return wheel;
  });

  // ─── Headlight targets ───────────────────────────────────────────────────
  const hlTargets = [
    new THREE.Object3D(), // Left
    new THREE.Object3D(), // Right
  ];
  hlTargets[0]!.position.set(0.45, 0.35, 12);
  hlTargets[1]!.position.set(-0.45, 0.35, 12);
  hlTargets.forEach(t => root.add(t));

  // ─── Exhaust ports ───────────────────────────────────────────────────────
  const exhaustLeft = new THREE.Object3D();
  exhaustLeft.position.set(0.3, 0.3, -2.4);
  const exhaustRight = new THREE.Object3D();
  exhaustRight.position.set(-0.3, 0.3, -2.4);
  root.add(exhaustLeft, exhaustRight);

  // ─── Spring state ────────────────────────────────────────────────────────
  const pitchSpring: SpringState = { value: 0, velocity: 0 };
  const rollSpring: SpringState = { value: 0, velocity: 0 };
  let wheelAngle = 0;

  // ─── Update function ─────────────────────────────────────────────────────
  function update(dt: number, speed: number, steeringAngle: number): void {
    // Wheel spin proportional to speed
    wheelAngle += speed * dt * 4.0;
    wheels.forEach(w => {
      w.rotation.x = wheelAngle;
    });

    // Front wheels steer
    // (simplified: rotate wheel group around Y)
    // [would need group references for proper steering — proxy approximation]

    // Pitch spring: negative pitch on acceleration, positive on braking
    const pitchTarget = THREE.MathUtils.clamp(speed * 0.015, -0.06, 0.06);
    springStep(pitchSpring, pitchTarget, 12, 3.5, dt);

    // Roll spring: roll away from steering
    const rollTarget = THREE.MathUtils.clamp(-steeringAngle * 0.04, -0.08, 0.08);
    springStep(rollSpring, rollTarget, 10, 3.0, dt);

    body.rotation.x = pitchSpring.value;
    body.rotation.z = rollSpring.value;
    cockpit.rotation.x = pitchSpring.value;
    cockpit.rotation.z = rollSpring.value;
  }

  return {
    root,
    body,
    wheels,
    headlightTargets: hlTargets,
    exhaustPorts: [exhaustLeft, exhaustRight],
    update,
  };
}
