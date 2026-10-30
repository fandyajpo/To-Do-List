// Procedural placeholder Honda Civic Ferio EK3 — smooth stylized geometry.
// This is NOT a verified mechanical model; it stands in until authored GLB
// assets exist. Hierarchy mirrors the planned asset tree so parts can be
// swapped one-for-one later.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const M = {
  paint: () => new THREE.MeshStandardMaterial({ color: 0x2c5f9e, metalness: 0.65, roughness: 0.38 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x1b1e24, metalness: 0.3, roughness: 0.85 }),
  chrome: () => new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.9, roughness: 0.25 }),
  glass: () => new THREE.MeshStandardMaterial({ color: 0xa8d8f0, metalness: 0.4, roughness: 0.08, transparent: true, opacity: 0.35 }),
  tire: () => new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.95 }),
  rim: () => new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 0.85, roughness: 0.3 }),
  head: () => new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xffeeaa, emissiveIntensity: 1.4, roughness: 0.2 }),
  tail: () => new THREE.MeshStandardMaterial({ color: 0x8f1414, emissive: 0xff2222, emissiveIntensity: 0.35, roughness: 0.3 }),
  interior: () => new THREE.MeshStandardMaterial({ color: 0x24262b, roughness: 0.9, metalness: 0.1 }),
  engine: () => new THREE.MeshStandardMaterial({ color: 0x2d323a, metalness: 0.5, roughness: 0.6 })
};

function rounded(w, h, d, r = 0.05, seg = 3) {
  return new RoundedBoxGeometry(w, h, d, seg, r);
}

// A damper animates one scalar smoothly toward a target every frame.
function damper(v, apply) {
  return { v, t: v, apply };
}

// Mark a mesh selectable and give it its own material so highlighting
// does not leak to other parts sharing a material.
function selectable(mesh, id) {
  mesh.material = mesh.material.clone();
  mesh.userData.componentId = id;
  mesh.castShadow = true;
  return mesh;
}

export function buildCar() {
  const car = new THREE.Group();
  const doors = [];
  const wheels = [];

  const paint = M.paint();
  const dark = M.dark();

  // ---- Body shell ----
  const body = new THREE.Mesh(rounded(1.7, 0.5, 4.3, 0.14), paint);
  body.position.set(0, 0.6, 0);
  body.castShadow = true;
  body.userData.componentId = 'vehicle.exterior.body';
  car.add(body);

  // Front and rear bumper covers
  const bumperF = new THREE.Mesh(rounded(1.74, 0.2, 0.3, 0.08), dark);
  bumperF.position.set(0, 0.42, 2.18);
  const bumperR = bumperF.clone();
  bumperR.position.z = -2.18;
  car.add(bumperF, bumperR);

  // Side skirts
  const skirtL = new THREE.Mesh(rounded(0.08, 0.12, 2.4, 0.03), dark);
  skirtL.position.set(0.85, 0.36, 0);
  const skirtR = skirtL.clone();
  skirtR.position.x = -0.85;
  car.add(skirtL, skirtR);

  // ---- Greenhouse: roof, pillars, glass band ----
  const roof = new THREE.Mesh(rounded(1.5, 0.09, 2.3, 0.04), paint);
  roof.position.set(0, 1.33, -0.28);
  roof.castShadow = true;
  roof.userData.componentId = 'vehicle.exterior.roof';
  car.add(roof);

  const glassBand = new THREE.Mesh(rounded(1.5, 0.32, 2.24, 0.03), M.glass());
  glassBand.position.set(0, 1.12, -0.28);
  glassBand.userData.isGlass = true;
  car.add(glassBand);

  const pillarGeo = rounded(0.07, 0.34, 0.08, 0.02);
  for (const [x, z] of [[0.73, 0.86], [-0.73, 0.86], [0.73, -0.28], [-0.73, -0.28], [0.73, -1.4], [-0.73, -1.4]]) {
    const p = new THREE.Mesh(pillarGeo, paint);
    p.position.set(x, 1.12, z);
    car.add(p);
  }

  // Windshield and rear glass slabs
  const windshield = new THREE.Mesh(rounded(1.42, 0.05, 0.62, 0.02), M.glass());
  windshield.position.set(0, 1.1, 1.0);
  windshield.rotation.x = -0.45;
  windshield.userData.isGlass = true;
  windshield.userData.componentId = 'vehicle.exterior.windshield';
  car.add(windshield);

  const rearGlass = new THREE.Mesh(rounded(1.42, 0.05, 0.55, 0.02), M.glass());
  rearGlass.position.set(0, 1.1, -1.52);
  rearGlass.rotation.x = 0.45;
  rearGlass.userData.isGlass = true;
  rearGlass.userData.componentId = 'vehicle.exterior.rear_glass';
  car.add(rearGlass);

  // ---- Hood (hinged at cowl, opens at front) ----
  const hoodPivot = new THREE.Group();
  hoodPivot.position.set(0, 0.92, 1.12);
  const hood = new THREE.Mesh(rounded(1.55, 0.07, 0.95, 0.03), paint);
  hood.position.set(0, 0, 0.475);
  hoodPivot.add(selectable(hood, 'vehicle.exterior.hood'));
  car.add(hoodPivot);
  const hoodDamper = damper(0, (v) => { hoodPivot.rotation.x = v; });

  // ---- Trunk lid (hinged at forward edge) ----
  const trunkPivot = new THREE.Group();
  trunkPivot.position.set(0, 0.92, -1.45);
  const trunk = new THREE.Mesh(rounded(1.55, 0.07, 0.62, 0.03), paint);
  trunk.position.set(0, 0, -0.31);
  trunkPivot.add(selectable(trunk, 'vehicle.exterior.trunk'));
  car.add(trunkPivot);
  const trunkDamper = damper(0, (v) => { trunkPivot.rotation.x = v; });

  // ---- Four doors, each on its own hinge ----
  // side: +1 = left (+x), -1 = right (-x); hinge at the door's front edge.
  function makeDoor(id, side, zFront, len, openAngle) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.86, 0.66, zFront);

    const shell = new THREE.Mesh(rounded(0.07, 0.62, len, 0.03), paint);
    shell.position.set(0, 0, -len / 2);
    pivot.add(selectable(shell, id));

    const glass = new THREE.Mesh(rounded(0.05, 0.3, len - 0.14, 0.02), M.glass());
    glass.position.set(side * 0.005, 0.47, -len / 2);
    glass.userData.isGlass = true;
    pivot.add(glass);

    const handle = new THREE.Mesh(rounded(0.03, 0.05, 0.16, 0.015), M.chrome());
    handle.position.set(side * 0.05, 0.12, -len * 0.72);
    pivot.add(handle);

    const openDamper = damper(0, (v) => { pivot.rotation.y = v; });
    const glassDamper = damper(glass.position.y, (v) => { glass.position.y = v; });

    car.add(pivot);
    doors.push({ pivot, glass, glassBaseY: glass.position.y, openDamper, openAngle, glassDamper });
  }

  makeDoor('vehicle.exterior.door.front_left', 1, 1.05, 0.95, -1.0);
  makeDoor('vehicle.exterior.door.front_right', -1, 1.05, 0.95, 1.0);
  makeDoor('vehicle.exterior.door.rear_left', 1, 0.05, 0.88, -1.0);
  makeDoor('vehicle.exterior.door.rear_right', -1, 0.05, 0.88, 1.0);

  // Mirrors on the front door frames
  for (const side of [1, -1]) {
    const mirror = new THREE.Mesh(rounded(0.1, 0.09, 0.16, 0.03), dark);
    mirror.position.set(side * 0.98, 1.06, 0.92);
    mirror.userData.componentId = 'vehicle.exterior.mirrors';
    car.add(mirror);
  }

  // ---- Grille, emblem, lamps ----
  const grille = new THREE.Mesh(rounded(0.85, 0.16, 0.06, 0.02), dark);
  grille.position.set(0, 0.74, 2.14);
  grille.userData.componentId = 'vehicle.exterior.grille';
  car.add(grille);

  const emblem = new THREE.Mesh(rounded(0.09, 0.09, 0.03, 0.015), M.chrome());
  emblem.position.set(0, 0.74, 2.18);
  car.add(emblem);

  const headMat = M.head();
  for (const side of [1, -1]) {
    const lamp = new THREE.Mesh(rounded(0.34, 0.14, 0.08, 0.03), headMat);
    lamp.position.set(side * 0.56, 0.76, 2.14);
    lamp.userData.componentId = 'vehicle.exterior.headlights';
    car.add(lamp);
  }

  const tailMat = M.tail();
  for (const side of [1, -1]) {
    const lamp = new THREE.Mesh(rounded(0.4, 0.14, 0.08, 0.03), tailMat);
    lamp.position.set(side * 0.56, 0.78, -2.14);
    lamp.userData.componentId = 'vehicle.exterior.taillights';
    car.add(lamp);
  }

  // ---- Wheels ----
  function makeWheel(id, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0.31, z);

    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.21, 28), M.tire());
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 20), M.rim());
    rim.rotation.z = Math.PI / 2;

    g.add(tire, selectable(rim, id));
    car.add(g);

    const baseX = g.position.x;
    const d = damper(0, (v) => { g.position.x = baseX + v; });
    wheels.push({ group: g, damper: d, dir: Math.sign(x) });
  }

  makeWheel('vehicle.wheels.front_left', 0.8, 1.42);
  makeWheel('vehicle.wheels.front_right', -0.8, 1.42);
  makeWheel('vehicle.wheels.rear_left', 0.8, -1.42);
  makeWheel('vehicle.wheels.rear_right', -0.8, -1.42);

  // ---- Engine bay (placeholder D16Y8 hint, visible with hood open) ----
  const engineBlock = new THREE.Mesh(rounded(0.95, 0.32, 0.85, 0.05), M.engine());
  engineBlock.position.set(0, 0.66, 1.58);
  engineBlock.userData.componentId = 'vehicle.engine.block';
  car.add(engineBlock);

  const valveCover = new THREE.Mesh(rounded(0.5, 0.08, 0.65, 0.03), new THREE.MeshStandardMaterial({ color: 0x9aa5b1, metalness: 0.6, roughness: 0.4 }));
  valveCover.position.set(0, 0.85, 1.58);
  valveCover.userData.componentId = 'vehicle.engine.valve_cover';
  car.add(valveCover);

  const radiator = new THREE.Mesh(rounded(0.9, 0.36, 0.07, 0.02), dark);
  radiator.position.set(0, 0.65, 2.0);
  radiator.userData.componentId = 'vehicle.engine.radiator';
  car.add(radiator);

  const battery = new THREE.Mesh(rounded(0.3, 0.18, 0.22, 0.03), M.dark());
  battery.position.set(0.55, 0.66, 1.0);
  battery.userData.componentId = 'vehicle.engine.battery';
  car.add(battery);

  // Radiator fan — spins while the engine-start simulation runs.
  const engineFan = new THREE.Group();
  engineFan.position.set(0, 0.65, 1.93);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), M.dark());
  hub.rotation.x = Math.PI / 2;
  engineFan.add(hub);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(rounded(0.05, 0.26, 0.02, 0.01, 2), M.dark());
    blade.position.set(Math.sin((i * Math.PI) / 2) * 0.15, Math.cos((i * Math.PI) / 2) * 0.15, 0);
    blade.rotation.z = -(i * Math.PI) / 2;
    engineFan.add(blade);
  }
  car.add(engineFan);

  // ---- Interior hint: dashboard, steering wheel, seats ----
  const dash = new THREE.Mesh(rounded(1.4, 0.22, 0.35, 0.05), M.interior());
  dash.position.set(0, 0.98, 0.78);
  dash.userData.componentId = 'vehicle.interior.dashboard';
  car.add(dash);

  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 10, 24), M.interior());
  wheel.position.set(0.38, 1.0, 0.6);
  wheel.rotation.x = -0.9;
  wheel.userData.componentId = 'vehicle.interior.steering_wheel';
  car.add(wheel);

  for (const x of [0.38, -0.38]) {
    const cushion = new THREE.Mesh(rounded(0.45, 0.14, 0.5, 0.05), M.interior());
    cushion.position.set(x, 0.78, 0.1);
    const backrest = new THREE.Mesh(rounded(0.45, 0.55, 0.12, 0.05), M.interior());
    backrest.position.set(x, 1.0, -0.2);
    backrest.rotation.x = 0.15;
    cushion.userData.componentId = 'vehicle.interior.seats';
    backrest.userData.componentId = 'vehicle.interior.seats';
    car.add(cushion, backrest);
  }

  return {
    group: car,
    hoodDamper,
    trunkDamper,
    doors,
    wheels,
    headMat,
    tailMat,
    engineFan,
    engineBlock,
    engineBaseY: engineBlock.position.y,
    glassBand
  };
}
