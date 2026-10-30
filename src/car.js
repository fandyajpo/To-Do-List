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
    glassBand,
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
    explodable
  };
}
