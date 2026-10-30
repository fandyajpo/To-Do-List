// Procedural placeholder Honda Civic Ferio EK3 — smooth stylized geometry.
// This is NOT a verified mechanical model; it stands in until authored GLB
// assets exist. Hierarchy mirrors the planned asset tree so parts can be
// swapped one-for-one later.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const M = {
  paint: () => new THREE.MeshStandardMaterial({ color: 0x1e3cc8, metalness: 0.6, roughness: 0.35 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x1b1e24, metalness: 0.3, roughness: 0.85 }),
  chrome: () => new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.9, roughness: 0.25 }),
  glass: () => new THREE.MeshStandardMaterial({ color: 0xa8d8f0, metalness: 0.4, roughness: 0.08, transparent: true, opacity: 0.35 }),
  tire: () => new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.95 }),
  rim: () => new THREE.MeshStandardMaterial({ color: 0x4a4f58, metalness: 0.85, roughness: 0.35 }),
  head: () => new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xffeeaa, emissiveIntensity: 1.4, roughness: 0.2 }),
  tail: () => new THREE.MeshStandardMaterial({ color: 0x8f1414, emissive: 0xff2222, emissiveIntensity: 0.35, roughness: 0.3 }),
  interior: () => new THREE.MeshStandardMaterial({ color: 0x24262b, roughness: 0.9, metalness: 0.1 }),
  engine: () => new THREE.MeshStandardMaterial({ color: 0x2d323a, metalness: 0.5, roughness: 0.6 })
};

function rounded(w, h, d, r = 0.05, seg = 3) {
  return new RoundedBoxGeometry(w, h, d, seg, r);
}

// Extrudes a side-profile polyline across the car's width with beveled
// (rounded) flanks. points are [z, y] pairs in car coordinates; the
// silhouette stays true while the flanks curve like real bodywork.
function profileMesh(points, width, bevel, material) {
  const shape = new THREE.Shape();
  shape.moveTo(-points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(-points[i][0], points[i][1]);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 1
  });
  geo.rotateY(Math.PI / 2);
  geo.translate(-width / 2, 0, 0);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
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

  // ---- Body shell: extruded side profile for a real EK sedan silhouette ----
  // Long sloping hood, compact cabin, defined trunk deck, rounded flanks.
  const body = profileMesh([
    [2.2, 0.3], [2.25, 0.5], [2.1, 0.7], [1.8, 0.78],
    [0.9, 0.88], [-0.6, 0.88], [-1.2, 0.89],
    [-1.95, 0.86], [-2.1, 0.72], [-2.18, 0.48], [-2.08, 0.3]
  ], 1.5, 0.07, paint);
  body.userData.componentId = 'vehicle.exterior.body';
  car.add(body);

  // Black lower valances under the body-color bumper contours
  const valanceGeo = rounded(1.5, 0.14, 0.2, 0.05);
  for (const z of [2.12, -2.12]) {
    const v = new THREE.Mesh(valanceGeo, dark);
    v.position.set(0, 0.36, z);
    car.add(v);
  }

  // Rectangular lower air intake on the front bumper
  const intake = new THREE.Mesh(rounded(0.9, 0.09, 0.06, 0.02), dark);
  intake.position.set(0, 0.4, 2.22);
  car.add(intake);

  // Side skirts + black side moldings (per reference photos)
  const skirtL = new THREE.Mesh(rounded(0.08, 0.12, 2.4, 0.03), dark);
  skirtL.position.set(0.8, 0.36, 0);
  const skirtR = skirtL.clone();
  skirtR.position.x = -0.8;
  car.add(skirtL, skirtR);

  const moldingGeo = rounded(0.02, 0.06, 2.5, 0.008, 1);
  for (const side of [1, -1]) {
    const molding = new THREE.Mesh(moldingGeo, dark);
    molding.position.set(side * 0.84, 0.62, 0.1);
    car.add(molding);
  }

  // Front lip under the bumper
  const frontLip = new THREE.Mesh(rounded(1.66, 0.05, 0.18, 0.02), dark);
  frontLip.position.set(0, 0.28, 2.2);
  car.add(frontLip);

  // ---- Greenhouse: roof, pillars, glass — set in from the body flanks ----
  const roof = new THREE.Mesh(rounded(1.42, 0.06, 1.51, 0.03), paint);
  roof.position.set(0, 1.44, -0.345);
  roof.castShadow = true;
  roof.userData.componentId = 'vehicle.exterior.roof';
  car.add(roof);

  const windshield = new THREE.Mesh(rounded(1.38, 0.712, 0.05, 0.02), M.glass());
  windshield.position.set(0, 1.16, 0.63);
  windshield.rotation.x = -0.666;
  windshield.userData.isGlass = true;
  windshield.userData.componentId = 'vehicle.exterior.windshield';
  car.add(windshield);

  const rearGlass = new THREE.Mesh(rounded(1.36, 0.595, 0.05, 0.02), M.glass());
  rearGlass.position.set(0, 1.17, -1.225);
  rearGlass.rotation.x = -2.71;
  rearGlass.userData.isGlass = true;
  rearGlass.userData.componentId = 'vehicle.exterior.rear_glass';
  car.add(rearGlass);

  const pillarMat = dark;
  for (const side of [1, -1]) {
    // A-pillars follow the windshield slope
    const aPillar = new THREE.Mesh(rounded(0.06, 0.712, 0.07, 0.02), pillarMat);
    aPillar.position.set(side * 0.73, 1.16, 0.58);
    aPillar.rotation.x = -0.666;
    car.add(aPillar);
    // B-pillars between the doors
    const bPillar = new THREE.Mesh(rounded(0.06, 0.58, 0.07, 0.02), pillarMat);
    bPillar.position.set(side * 0.73, 1.16, -0.3);
    car.add(bPillar);
    // C-pillars: short and steep, flowing into the deck
    const cPillar = new THREE.Mesh(rounded(0.06, 0.6, 0.1, 0.02), pillarMat);
    cPillar.position.set(side * 0.73, 1.16, -1.25);
    cPillar.rotation.x = -2.71;
    car.add(cPillar);
    // Rear quarter glass
    const quarter = new THREE.Mesh(rounded(0.04, 0.28, 0.42, 0.015), M.glass());
    quarter.position.set(side * 0.74, 1.12, -0.75);
    quarter.userData.isGlass = true;
    car.add(quarter);
    // Black beltline trim along the window base
    const belt = new THREE.Mesh(rounded(0.02, 0.04, 2.2, 0.008, 1), dark);
    belt.position.set(side * 0.72, 0.92, -0.25);
    car.add(belt);
  }

  // ---- Hood (hinged at cowl, opens at front; sits over the sloping profile) ----
  const hoodPivot = new THREE.Group();
  hoodPivot.position.set(0, 0.885, 0.95);
  const hood = new THREE.Mesh(rounded(1.56, 0.07, 1.0, 0.03), paint);
  hood.position.set(0, 0, 0.5);
  hoodPivot.add(selectable(hood, 'vehicle.exterior.hood'));
  car.add(hoodPivot);
  const hoodDamper = damper(0, (v) => { hoodPivot.rotation.x = v; });

  // ---- Trunk lid (flush with the high rear deck, between quarter panels) ----
  const trunkPivot = new THREE.Group();
  trunkPivot.position.set(0, 0.9, -1.2);
  const trunk = new THREE.Mesh(rounded(1.42, 0.07, 0.75, 0.03), paint);
  trunk.position.set(0, 0, -0.375);
  trunkPivot.add(selectable(trunk, 'vehicle.exterior.trunk'));

  // Lip spoiler riding on the trunk lid
  const spoilerBlade = new THREE.Mesh(rounded(1.36, 0.04, 0.14, 0.015), dark);
  spoilerBlade.position.set(0, 0.1, -0.6);
  spoilerBlade.userData.componentId = 'vehicle.exterior.spoiler';
  trunkPivot.add(spoilerBlade);
  for (const sx of [0.55, -0.55]) {
    const upright = new THREE.Mesh(rounded(0.04, 0.08, 0.08, 0.015), dark);
    upright.position.set(sx, 0.05, -0.56);
    trunkPivot.add(upright);
  }

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

    const glass = new THREE.Mesh(rounded(0.05, 0.3, len - 0.16, 0.02), M.glass());
    glass.position.set(side * -0.16, 0.42, -len / 2);
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

  // Mirrors near the front window corners
  for (const side of [1, -1]) {
    const mirror = new THREE.Mesh(rounded(0.1, 0.09, 0.16, 0.03), dark);
    mirror.position.set(side * 0.9, 1.02, 0.8);
    mirror.userData.componentId = 'vehicle.exterior.mirrors';
    car.add(mirror);
  }

  // ---- Grille (body-colored surround with dark mesh), emblem, lamps ----
  const grille = new THREE.Mesh(rounded(0.68, 0.16, 0.06, 0.02), paint);
  grille.position.set(0, 0.72, 2.08);
  grille.userData.componentId = 'vehicle.exterior.grille';
  car.add(grille);

  const grilleMesh = new THREE.Mesh(rounded(0.6, 0.09, 0.07, 0.015), dark);
  grilleMesh.position.set(0, 0.72, 2.1);
  grilleMesh.userData.componentId = 'vehicle.exterior.grille';
  car.add(grilleMesh);

  const emblem = new THREE.Mesh(rounded(0.08, 0.08, 0.03, 0.015), M.chrome());
  emblem.position.set(0, 0.72, 2.14);
  car.add(emblem);

  const headMat = M.head();
  for (const side of [1, -1]) {
    const lamp = new THREE.Mesh(rounded(0.5, 0.12, 0.07, 0.025), headMat);
    lamp.position.set(side * 0.5, 0.72, 2.1);
    lamp.rotation.y = side * 0.08;
    lamp.userData.componentId = 'vehicle.exterior.headlights';
    car.add(lamp);
  }

  // Amber corner turn signals beside the headlamps
  const signalMat = new THREE.MeshStandardMaterial({ color: 0xff9500, emissive: 0xff9500, emissiveIntensity: 0.4, roughness: 0.3 });
  for (const side of [1, -1]) {
    const signal = new THREE.Mesh(rounded(0.09, 0.1, 0.08, 0.02), signalMat);
    signal.position.set(side * 0.79, 0.7, 2.05);
    signal.rotation.y = side * 0.35;
    signal.userData.componentId = 'vehicle.exterior.headlights';
    car.add(signal);
  }

  const tailMat = M.tail();
  for (const side of [1, -1]) {
    const lamp = new THREE.Mesh(rounded(0.44, 0.18, 0.07, 0.03), tailMat);
    lamp.position.set(side * 0.5, 0.74, -2.12);
    lamp.userData.componentId = 'vehicle.exterior.taillights';
    car.add(lamp);
    const wrap = new THREE.Mesh(rounded(0.06, 0.16, 0.18, 0.02), tailMat);
    wrap.position.set(side * 0.75, 0.74, -2.06);
    wrap.rotation.y = side * 0.5;
    wrap.userData.componentId = 'vehicle.exterior.taillights';
    car.add(wrap);
  }

  // Rear license plate recess and trunk emblem
  const plateRecess = new THREE.Mesh(rounded(0.44, 0.14, 0.03, 0.01), dark);
  plateRecess.position.set(0, 0.7, -2.16);
  car.add(plateRecess);
  const plate = new THREE.Mesh(rounded(0.4, 0.1, 0.02, 0.005, 1), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }));
  plate.position.set(0, 0.7, -2.17);
  car.add(plate);
  const trunkEmblem = new THREE.Mesh(rounded(0.07, 0.07, 0.03, 0.015), M.chrome());
  trunkEmblem.position.set(0, 0.82, -2.13);
  car.add(trunkEmblem);

  // ---- Wheels ----
  function makeWheel(id, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0.31, z);

    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 28), M.tire());
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 20), M.rim());
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

  // ---- Suspension, brakes & steering (placeholder double-wishbone) ----
  // Each corner records its parts with explode offsets and a brake-service
  // slide, so corners can explode and brakes can come apart in order.
  function susPart(id, mesh) {
    mesh.castShadow = true;
    return mesh;
  }

  const suspension = [];
  const CORNERS = [
    [1, 1.42, 'front_left'],
    [-1, 1.42, 'front_right'],
    [1, -1.42, 'rear_left'],
    [-1, -1.42, 'rear_right']
  ];

  const coilGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.24, 12, 1, true);
  const coilMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.6, side: THREE.DoubleSide });
  const shockMat = new THREE.MeshStandardMaterial({ color: 0x666a70, metalness: 0.6, roughness: 0.4 });

  for (const [side, z, corner] of CORNERS) {
    const parts = [];
    const rec = { corner, side, parts, explode: { v: 0, t: 0 }, service: { v: 0, t: 0 }, serviceStep: 0 };
    function sPart(cat, mesh, off, slide) {
      mesh.userData.componentId = 'vehicle.suspension.' + corner + '.' + cat;
      parts.push({ mesh, base: mesh.position.clone(), off: new THREE.Vector3(...off), cat, slide: slide || 0 });
      car.add(mesh);
      return mesh;
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), M.chrome());
    hub.rotation.z = Math.PI / 2;
    hub.position.set(side * 0.66, 0.31, z);
    sPart('hub', hub, [side * 0.55, 0.05, 0]);

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.024, 20), M.chrome());
    disc.rotation.z = Math.PI / 2;
    disc.position.set(side * 0.58, 0.31, z);
    sPart('brakes', disc, [side * 0.4, 0.12, 0], 0.7);

    const caliper = new THREE.Mesh(rounded(0.06, 0.13, 0.1, 0.02), M.dark());
    caliper.position.set(side * 0.58, 0.44, z);
    sPart('brakes', caliper, [side * 0.4, 0.12, 0], 0.35);

    const shock = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), shockMat);
    shock.position.set(side * 0.5, 0.62, z * 0.88);
    sPart('coil', shock, [side * 0.12, 0.45, 0]);

    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.position.set(side * 0.5, 0.52, z * 0.88);
    sPart('coil', coil, [side * 0.12, 0.45, 0]);

    const lower = new THREE.Mesh(rounded(0.36, 0.04, 0.06, 0.015), M.dark());
    lower.position.set(side * 0.4, 0.5, z);
    sPart('arms', lower, [side * 0.2, -0.35, 0]);

    const upper = new THREE.Mesh(rounded(0.3, 0.04, 0.05, 0.015), M.dark());
    upper.position.set(side * 0.4, 0.72, z);
    sPart('arms', upper, [side * 0.2, -0.35, 0]);

    suspension.push(rec);
  }

  // Steering rack and tie rods
  const rack = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 10), M.chrome());
  rack.rotation.z = Math.PI / 2;
  rack.position.set(0, 0.45, 1.35);
  susPart('vehicle.steering.rack', rack);

  for (const side of [1, -1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), M.chrome());
    rod.rotation.x = Math.PI / 2;
    rod.position.set(side * 0.62, 0.45, 1.38);
    susPart('vehicle.steering.tie_rods', rod);
  }

  // Undercarriage: floor pan, exhaust, fuel tank
  const floorPan = new THREE.Mesh(rounded(1.5, 0.05, 2.6, 0.02), M.dark());
  floorPan.position.set(0, 0.52, -0.2);
  susPart('vehicle.undercarriage.floor_pan', floorPan);

  const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.8, 10), M.chrome());
  exhaustPipe.rotation.x = Math.PI / 2;
  exhaustPipe.position.set(0.2, 0.4, -1.3);
  susPart('vehicle.undercarriage.exhaust', exhaustPipe);

  const muffler = new THREE.Mesh(rounded(0.3, 0.14, 0.4, 0.05), M.chrome());
  muffler.position.set(0.2, 0.4, -2.0);
  susPart('vehicle.undercarriage.exhaust', muffler);

  const fuelTank = new THREE.Mesh(rounded(0.8, 0.16, 0.5, 0.05), M.dark());
  fuelTank.position.set(-0.2, 0.58, -1.6);
  susPart('vehicle.undercarriage.fuel_tank', fuelTank);

  // ---- Engine bay (placeholder D16Y8, visible with hood open, explodable) ----
  const explodable = [];
  function bayPart(id, mesh, off) {
    mesh.userData.componentId = id;
    mesh.castShadow = true;
    explodable.push({ mesh, base: mesh.position.clone(), off: new THREE.Vector3(...off) });
    car.add(mesh);
    return mesh;
  }

  const engineBlock = new THREE.Mesh(rounded(0.95, 0.32, 0.85, 0.05), M.engine());
  engineBlock.position.set(0, 0.66, 1.58);
  bayPart('vehicle.engine.block', engineBlock, [0, 0, 0]);

  const valveCover = new THREE.Mesh(rounded(0.5, 0.08, 0.65, 0.03), new THREE.MeshStandardMaterial({ color: 0x9aa5b1, metalness: 0.6, roughness: 0.4 }));
  valveCover.position.set(0, 0.84, 1.58);
  bayPart('vehicle.engine.valve_cover', valveCover, [0, 0.55, 0]);

  // Intake: manifold on the front face of the block, airbox behind it
  const intakeManifold = new THREE.Mesh(rounded(0.28, 0.26, 0.3, 0.05), M.engine());
  intakeManifold.position.set(-0.3, 0.7, 1.75);
  bayPart('vehicle.engine.intake_manifold', intakeManifold, [-0.5, 0.15, 0.5]);

  const throttleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14), M.chrome());
  throttleBody.rotation.x = Math.PI / 2;
  throttleBody.position.set(-0.3, 0.7, 1.9);
  bayPart('vehicle.engine.throttle_body', throttleBody, [-0.6, 0.2, 0.8]);

  const airFilter = new THREE.Mesh(rounded(0.34, 0.28, 0.3, 0.05), M.dark());
  airFilter.position.set(-0.45, 0.7, 1.05);
  bayPart('vehicle.engine.air_filter', airFilter, [-0.8, 0.3, -0.6]);

  const fuelRail = new THREE.Mesh(rounded(0.24, 0.05, 0.26, 0.015), M.chrome());
  fuelRail.position.set(-0.3, 0.82, 1.75);
  bayPart('vehicle.engine.fuel_rail', fuelRail, [-0.3, 0.85, 0.6]);

  const radiator = new THREE.Mesh(rounded(0.9, 0.36, 0.07, 0.02), dark);
  radiator.position.set(0, 0.65, 2.0);
  bayPart('vehicle.engine.radiator', radiator, [0, 0, 0.9]);

  const radHose = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 14, Math.PI / 2), M.dark());
  radHose.position.set(0.4, 0.8, 2.0);
  radHose.rotation.z = -Math.PI / 2;
  bayPart('vehicle.engine.radiator_hose', radHose, [0, 0.25, 0.9]);

  const coolantRes = new THREE.Mesh(rounded(0.16, 0.2, 0.1, 0.03), new THREE.MeshStandardMaterial({ color: 0xd8e8f0, transparent: true, opacity: 0.85, roughness: 0.2 }));
  coolantRes.position.set(0.62, 0.76, 1.85);
  bayPart('vehicle.engine.coolant_reservoir', coolantRes, [0.7, 0.35, 0.9]);

  const battery = new THREE.Mesh(rounded(0.3, 0.18, 0.22, 0.03), M.dark());
  battery.position.set(0.55, 0.66, 1.0);
  bayPart('vehicle.engine.battery', battery, [0.8, 0.45, -0.4]);

  const alternator = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 14), M.chrome());
  alternator.position.set(0.55, 0.8, 1.25);
  bayPart('vehicle.engine.alternator', alternator, [0.9, 0.25, -0.2]);

  const distributor = new THREE.Mesh(rounded(0.12, 0.1, 0.12, 0.03), M.dark());
  distributor.position.set(-0.18, 0.8, 1.3);
  bayPart('vehicle.engine.distributor', distributor, [-0.2, 0.75, -0.5]);

  const oilPan = new THREE.Mesh(rounded(0.8, 0.14, 0.7, 0.03), M.engine());
  oilPan.position.set(0, 0.44, 1.55);
  bayPart('vehicle.engine.oil_pan', oilPan, [0, -0.4, 0]);

  const exhaustManifold = new THREE.Mesh(rounded(0.6, 0.16, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: 0x4a4a48, metalness: 0.5, roughness: 0.7 }));
  exhaustManifold.position.set(0, 0.66, 1.18);
  bayPart('vehicle.engine.exhaust_manifold', exhaustManifold, [0, 0.1, -0.7]);

  const transmission = new THREE.Mesh(rounded(0.38, 0.34, 0.55, 0.05), M.engine());
  transmission.position.set(-0.55, 0.62, 1.5);
  bayPart('vehicle.engine.transmission', transmission, [-0.9, -0.1, 0]);

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

  // ---- Interior: dashboard, cluster, steering, console, seats ----
  const dash = new THREE.Mesh(rounded(1.4, 0.22, 0.35, 0.05), M.interior());
  dash.position.set(0, 0.98, 0.78);
  dash.userData.componentId = 'vehicle.interior.dashboard';
  car.add(dash);

  // Instrument cluster with gauge faces and needles
  const clusterMat = new THREE.MeshStandardMaterial({ color: 0x0d0f13, emissive: 0x66ccff, emissiveIntensity: 0.12, roughness: 0.4 });
  const cluster = new THREE.Mesh(rounded(0.3, 0.14, 0.05, 0.02), M.dark());
  cluster.position.set(0.38, 1.13, 0.86);
  cluster.userData.componentId = 'vehicle.interior.instrument_cluster';
  car.add(cluster);

  function makeGauge(x) {
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 20), clusterMat);
    face.rotation.x = Math.PI / 2;
    face.position.set(x, 1.13, 0.885);
    car.add(face);

    const pivot = new THREE.Group();
    pivot.position.set(x, 1.13, 0.895);
    const needle = new THREE.Mesh(rounded(0.008, 0.06, 0.004, 0.002, 1), new THREE.MeshStandardMaterial({ color: 0xff3322, emissive: 0xff3322, emissiveIntensity: 0.6 }));
    needle.position.y = 0.028;
    pivot.add(needle);
    car.add(pivot);
    return pivot;
  }
  const speedoNeedle = makeGauge(0.345);
  const tachNeedle = makeGauge(0.415);

  // Steering wheel on a tilted column, with a rotatable inner group
  const steerPivot = new THREE.Group();
  steerPivot.position.set(0.38, 1.0, 0.6);
  steerPivot.rotation.x = -0.9;
  car.add(steerPivot);

  const steerSpin = new THREE.Group();
  steerPivot.add(steerSpin);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 10, 28), M.interior());
  steerSpin.add(selectable(rim, 'vehicle.interior.steering_wheel'));

  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(rounded(0.03, 0.13, 0.02, 0.01, 1), M.interior());
    spoke.position.set(Math.sin((i * Math.PI * 2) / 3) * 0.07, Math.cos((i * Math.PI * 2) / 3) * 0.07, 0);
    spoke.rotation.z = -(i * Math.PI * 2) / 3;
    spoke.userData.componentId = 'vehicle.interior.steering_wheel';
    steerSpin.add(spoke);
  }

  const wheelHub = new THREE.Mesh(rounded(0.05, 0.05, 0.03, 0.015, 1), M.dark());
  steerSpin.add(wheelHub);

  // Center console, gear lever, handbrake
  const centerConsole = new THREE.Mesh(rounded(0.3, 0.24, 0.62, 0.04), M.interior());
  centerConsole.position.set(0, 0.86, 0.15);
  centerConsole.userData.componentId = 'vehicle.interior.console';
  car.add(centerConsole);

  const gearPivot = new THREE.Group();
  gearPivot.position.set(0, 0.99, 0.32);
  const gearBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.05, 12), M.dark());
  gearBoot.position.y = 0.02;
  const gearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), M.chrome());
  gearShaft.position.y = 0.09;
  const gearKnob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), M.dark());
  gearKnob.position.y = 0.17;
  gearKnob.userData.componentId = 'vehicle.interior.gear_selector';
  gearPivot.add(gearBoot, gearShaft, gearKnob);
  car.add(gearPivot);
  const gearDamper = damper(0, (v) => { gearPivot.rotation.x = v; });

  const brakePivot = new THREE.Group();
  brakePivot.position.set(0.22, 0.93, -0.02);
  const brakeLever = new THREE.Mesh(rounded(0.04, 0.2, 0.05, 0.02), M.dark());
  brakeLever.position.y = 0.1;
  brakeLever.userData.componentId = 'vehicle.interior.handbrake';
  brakePivot.add(brakeLever);
  car.add(brakePivot);
  const brakeDamper = damper(0, (v) => { brakePivot.rotation.x = v; });

  // Pedals (clutch / brake / accelerator)
  function makePedal(id, x) {
    const pad = new THREE.Mesh(rounded(0.09, 0.16, 0.03, 0.012, 1), M.dark());
    pad.position.set(x, 0.62, 0.92);
    pad.rotation.x = 0.35;
    pad.userData.componentId = id;
    car.add(pad);
    return pad;
  }
  makePedal('vehicle.interior.pedals.clutch', -0.06);
  makePedal('vehicle.interior.pedals.brake', 0.16);
  const accelPedal = makePedal('vehicle.interior.pedals.accelerator', 0.38);
  const accelDamper = damper(0, (v) => { accelPedal.rotation.x = 0.35 + v; });

  // Head unit and AC panel
  const headUnitMat = new THREE.MeshStandardMaterial({ color: 0x0e1116, emissive: 0x22ff88, emissiveIntensity: 0.06, roughness: 0.3 });
  const headUnit = new THREE.Mesh(rounded(0.26, 0.1, 0.04, 0.015, 1), headUnitMat);
  headUnit.position.set(0, 1.06, 0.9);
  headUnit.rotation.x = -0.15;
  headUnit.userData.componentId = 'vehicle.interior.head_unit';
  car.add(headUnit);

  const acPanel = new THREE.Mesh(rounded(0.26, 0.08, 0.04, 0.015, 1), M.dark());
  acPanel.position.set(0, 0.94, 0.9);
  acPanel.rotation.x = -0.15;
  acPanel.userData.componentId = 'vehicle.interior.ac_controls';
  car.add(acPanel);

  // Front seats, rear bench, carpet
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

  const rearCushion = new THREE.Mesh(rounded(1.25, 0.14, 0.5, 0.05), M.interior());
  rearCushion.position.set(0, 0.78, -0.95);
  const rearBackrest = new THREE.Mesh(rounded(1.25, 0.5, 0.12, 0.05), M.interior());
  rearBackrest.position.set(0, 1.0, -1.25);
  rearCushion.userData.componentId = 'vehicle.interior.rear_bench';
  rearBackrest.userData.componentId = 'vehicle.interior.rear_bench';
  car.add(rearCushion, rearBackrest);

  const carpet = new THREE.Mesh(rounded(1.3, 0.02, 2.0, 0.008, 1), M.dark());
  carpet.position.set(0, 0.56, -0.1);
  car.add(carpet);

  // Dome light with its own point light
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, emissive: 0xfff4d6, emissiveIntensity: 0.05, roughness: 0.6 });
  const domeLamp = new THREE.Mesh(rounded(0.14, 0.03, 0.07, 0.012, 1), domeMat);
  domeLamp.position.set(0, 1.275, -0.28);
  domeLamp.userData.componentId = 'vehicle.interior.dome_light';
  car.add(domeLamp);

  const domePoint = new THREE.PointLight(0xfff4d6, 0, 3);
  domePoint.position.set(0, 1.15, -0.28);
  car.add(domePoint);

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
    glassBand: null,
    steerSpin,
    speedoNeedle,
    tachNeedle,
    gearDamper,
    brakeDamper,
    accelDamper,
    clusterMat,
    headUnitMat,
    domeMat,
    domePoint,
    explodable,
    suspension
  };
}
