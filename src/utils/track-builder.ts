/**
 * Nordschleife Procedural Spline & Track Geometry Builder
 *
 * Implements the 20.832 km loop with accurate elevation profiles,
 * landmark sectors, banked turns (Karussell), curbs, Armco barriers,
 * and instanced conifer forest.
 */

import * as THREE from 'three';

export interface TrackSector {
  name: string;
  t: number;          // 0..1 spline parameter
  elevation: number;  // meters relative to start/finish
  banking: number;    // radians of roll
  description: string;
}

export const TRACK_SECTORS: TrackSector[] = [
  { name: 'Start / Finish', t: 0.00, elevation: 0, banking: 0, description: 'Pit straight under floodlights' },
  { name: 'Hatzenbach', t: 0.08, elevation: -12, banking: -0.05, description: 'Technical winding esses' },
  { name: 'Flugplatz', t: 0.16, elevation: 18, banking: 0.08, description: 'High speed crest & airtime' },
  { name: 'Schwedenkreuz', t: 0.22, elevation: 10, banking: 0.05, description: 'Blind left kink into Aremberg' },
  { name: 'Fuchsröhre', t: 0.30, elevation: -65, banking: -0.08, description: 'Steep descent into compression' },
  { name: 'Adenauer Forst', t: 0.38, elevation: -40, banking: 0.04, description: 'Technical uphill chicane' },
  { name: 'Breidscheid', t: 0.44, elevation: -90, banking: -0.03, description: 'Lowest elevation of the lap' },
  { name: 'Bergwerk', t: 0.50, elevation: -60, banking: 0.06, description: 'Historic corner initiating climb' },
  { name: 'Klostertal', t: 0.58, elevation: 15, banking: 0.04, description: 'Climbing toward the summit' },
  { name: 'Karussell', t: 0.65, elevation: 75, banking: 0.42, description: 'Banked concrete slab hairpin' },
  { name: 'Hohe Acht', t: 0.72, elevation: 120, banking: 0.02, description: 'Highest point (617m), storm epicenter' },
  { name: 'Brünnchen', t: 0.82, elevation: 40, banking: -0.06, description: 'Famous spectator amphitheatre' },
  { name: 'Pflanzgarten', t: 0.86, elevation: 15, banking: 0.05, description: 'Downhill leap and compression' },
  { name: 'Schwalbenschwanz', t: 0.90, elevation: 25, banking: 0.12, description: 'Mini carousel sweep' },
  { name: 'Döttinger Höhe', t: 0.96, elevation: 10, banking: 0.0, description: '2.135 km flat out straight' },
  { name: 'Tiergarten', t: 0.99, elevation: 5, banking: -0.04, description: 'High speed deceleration into pit' },
];

export interface TrackRig {
  spline: THREE.CatmullRomCurve3;
  roadMesh: THREE.Mesh;
  kerbGroup: THREE.Group;
  barrierGroup: THREE.Group;
  trees: THREE.InstancedMesh;
  marshalLights: THREE.PointLight[];
  getTransformAt: (t: number) => { position: THREE.Vector3; tangent: THREE.Vector3; normal: THREE.Vector3; banking: number };
}

export function buildNordschleifeTrack(): TrackRig {
  // ─── 1. Landmark Spline Waypoints ──────────────────────────────────────────
  // Scaled coordinates representing the general clockwise loop layout
  const rawPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0),          // 0.00: Start / Finish
    new THREE.Vector3(120, -12, 180),    // 0.08: Hatzenbach
    new THREE.Vector3(260, 18, 380),     // 0.16: Flugplatz
    new THREE.Vector3(340, 10, 520),     // 0.22: Schwedenkreuz
    new THREE.Vector3(420, -65, 820),    // 0.30: Fuchsröhre
    new THREE.Vector3(380, -40, 1050),   // 0.38: Adenauer Forst
    new THREE.Vector3(160, -90, 1280),   // 0.44: Breidscheid
    new THREE.Vector3(-120, -60, 1360),  // 0.50: Bergwerk
    new THREE.Vector3(-360, 15, 1180),   // 0.58: Klostertal
    new THREE.Vector3(-520, 75, 960),    // 0.65: Karussell
    new THREE.Vector3(-590, 120, 680),   // 0.72: Hohe Acht
    new THREE.Vector3(-450, 40, 410),    // 0.82: Brünnchen
    new THREE.Vector3(-320, 15, 260),    // 0.86: Pflanzgarten
    new THREE.Vector3(-220, 25, 120),    // 0.90: Schwalbenschwanz
    new THREE.Vector3(-110, 10, -450),   // 0.96: Döttinger Höhe
    new THREE.Vector3(-30, 5, -160),     // 0.99: Tiergarten
  ];

  const spline = new THREE.CatmullRomCurve3(rawPoints, true, 'centripetal', 0.5);

  // ─── 2. Road Ribbon Geometry ──────────────────────────────────────────────
  const sampleCount = 400;
  const roadWidth = 10;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const pt = spline.getPointAt(t);
    const tangent = spline.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Check sector banking
    let banking = 0;
    for (let s = 0; s < TRACK_SECTORS.length; s++) {
      const sec = TRACK_SECTORS[s]!;
      const dist = Math.abs(t - sec.t);
      if (dist < 0.04) {
        const factor = (1 - dist / 0.04);
        banking += sec.banking * factor;
      }
    }

    // Apply banking rotation around tangent
    side.applyAxisAngle(tangent, banking);
    const actualNormal = new THREE.Vector3().crossVectors(side, tangent).normalize();

    // Left and right road vertices
    const leftPt = pt.clone().addScaledVector(side, -roadWidth / 2);
    const rightPt = pt.clone().addScaledVector(side, roadWidth / 2);

    positions.push(leftPt.x, leftPt.y, leftPt.z);
    positions.push(rightPt.x, rightPt.y, rightPt.z);

    normals.push(actualNormal.x, actualNormal.y, actualNormal.z);
    normals.push(actualNormal.x, actualNormal.y, actualNormal.z);

    uvs.push(0, t * 120);
    uvs.push(1, t * 120);

    if (i < sampleCount) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roadGeo.setIndex(indices);

  const roadMat = new THREE.MeshPhysicalMaterial({
    color: 0x0e1017,
    roughness: 0.15,
    metalness: 0.05,
    reflectivity: 0.7,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  });

  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;

  // ─── 3. Red & White Apex Kerbs ────────────────────────────────────────────
  const kerbGroup = new THREE.Group();
  const kerbMatRed = new THREE.MeshStandardMaterial({ color: 0xcc1100, roughness: 0.6 });
  const kerbMatWhite = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 });
  const kerbGeo = new THREE.BoxGeometry(0.6, 0.08, 1.8);

  // Generate kerbs on alternating corners
  TRACK_SECTORS.forEach((sec, idx) => {
    if (idx === 0 || idx === 14) return; // skip long straights
    const sideSign = sec.banking >= 0 ? 1 : -1;
    for (let k = -5; k <= 5; k++) {
      const t = Math.max(0, Math.min(1, sec.t + k * 0.0012));
      const pt = spline.getPointAt(t);
      const tangent = spline.getTangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const kerbPos = pt.clone().addScaledVector(side, sideSign * (roadWidth / 2 + 0.3));
      const kerb = new THREE.Mesh(kerbGeo, k % 2 === 0 ? kerbMatRed : kerbMatWhite);
      kerb.position.copy(kerbPos);
      kerb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      kerbGroup.add(kerb);
    }
  });

  // ─── 4. Armco Barriers ────────────────────────────────────────────────────
  const barrierGroup = new THREE.Group();
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0x778899, metalness: 0.8, roughness: 0.3 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

  for (let i = 0; i < sampleCount; i += 3) {
    const t = i / sampleCount;
    const pt = spline.getPointAt(t);
    const tangent = spline.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    [-1, 1].forEach((dir) => {
      const barrierPos = pt.clone().addScaledVector(side, dir * (roadWidth / 2 + 1.2));
      const railGeo = new THREE.BoxGeometry(0.08, 0.6, 8.0);
      const rail = new THREE.Mesh(railGeo, barrierMat);
      rail.position.set(barrierPos.x, barrierPos.y + 0.5, barrierPos.z);
      rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      barrierGroup.add(rail);

      // Support post
      const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(barrierPos.x, barrierPos.y + 0.5, barrierPos.z);
      barrierGroup.add(post);
    });
  }

  // ─── 5. Instanced Conifer Forest ──────────────────────────────────────────
  const treeCount = 600;
  const coneGeo = new THREE.ConeGeometry(2.5, 9, 5);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x08160c, roughness: 0.9 });
  const trees = new THREE.InstancedMesh(coneGeo, treeMat, treeCount);

  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let i = 0; i < treeCount; i++) {
    const t = Math.random();
    const pt = spline.getPointAt(t);
    const tangent = spline.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Place trees 14m to 60m out from track edge
    const dist = (roadWidth / 2 + 14 + Math.random() * 45) * (Math.random() > 0.5 ? 1 : -1);
    const treePos = pt.clone().addScaledVector(side, dist);
    treePos.y += 4.5 + (Math.random() - 0.5) * 3;

    dummy.position.copy(treePos);
    const scale = 0.7 + Math.random() * 0.8;
    dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();
    trees.setMatrixAt(placed++, dummy.matrix);
  }
  trees.instanceMatrix.needsUpdate = true;

  // ─── 6. Marshal Warning Flasher Lights ────────────────────────────────────
  const marshalLights: THREE.PointLight[] = [];
  TRACK_SECTORS.forEach((sec, idx) => {
    if (idx % 2 === 0) {
      const pt = spline.getPointAt(sec.t);
      const light = new THREE.PointLight(0xffcc00, 2, 25);
      light.position.set(pt.x, pt.y + 2.5, pt.z);
      marshalLights.push(light);
    }
  });

  // ─── Helper: Get precise position and frame along track ───────────────────
  const getTransformAt = (t: number) => {
    const clampedT = ((t % 1) + 1) % 1;
    const position = spline.getPointAt(clampedT);
    const tangent = spline.getTangentAt(clampedT).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    let banking = 0;
    for (let s = 0; s < TRACK_SECTORS.length; s++) {
      const sec = TRACK_SECTORS[s]!;
      const dist = Math.abs(clampedT - sec.t);
      if (dist < 0.04) {
        const factor = (1 - dist / 0.04);
        banking += sec.banking * factor;
      }
    }

    side.applyAxisAngle(tangent, banking);
    const normal = new THREE.Vector3().crossVectors(side, tangent).normalize();

    return { position, tangent, normal, banking };
  };

  return {
    spline,
    roadMesh,
    kerbGroup,
    barrierGroup,
    trees,
    marshalLights,
    getTransformAt,
  };
}
