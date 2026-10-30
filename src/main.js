// Scene setup, camera system, interaction manager and UI wiring.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCar } from './car.js';
import { lookup } from './registry.js';

const stage = document.getElementById('stage');

// ---------- Renderer ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  document.getElementById('webgl-error').hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);
scene.fog = new THREE.Fog(0x0b0d12, 18, 42);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(6.5, 2.6, 7.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 0.2;
controls.maxDistance = 18;

// ---------- Lights ----------
scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x20242c, 0.9));

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(5, 8, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
scene.add(key);

const fill = new THREE.DirectionalLight(0x8899ff, 0.4);
fill.position.set(-6, 4, -4);
scene.add(fill);

// ---------- Ground ----------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(14, 48),
  new THREE.MeshStandardMaterial({ color: 0x14161d, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- Vehicle ----------
const car = buildCar();
scene.add(car.group);

// ---------- Size handling ----------
function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// ---------- Camera presets ----------
const camGoal = new THREE.Vector3();
const targetGoal = new THREE.Vector3();
let camLerp = false;

const PRESETS = {
  front: { pos: [0, 1.5, 8.2], target: [0, 0.8, 0] },
  rear: { pos: [0, 1.6, -8.2], target: [0, 0.8, 0] },
  side: { pos: [8.5, 1.3, 0], target: [0, 0.8, 0] },
  top: { pos: [0.01, 11, 0.01], target: [0, 0, 0] },
  engine: { pos: [2.6, 2.6, 4.4], target: [0, 0.85, 1.5] },
  driver: { pos: [0.38, 1.08, 0.55], target: [0.1, 0.95, -0.3] },
  dash: { pos: [0, 1.05, 0.35], target: [0, 0.98, 0.78] },
  rearseat: { pos: [0, 1.12, -1.0], target: [0, 1.0, 0.5] }
};

controls.addEventListener('start', () => { camLerp = false; });

function moveCamera(pos, target) {
  camGoal.set(...pos);
  targetGoal.set(...target);
  camLerp = true;
}

function view(name) {
  const p = PRESETS[name];
  if (!p) return;
  if (name === 'engine') setHood(true);
  moveCamera(p.pos, p.target);
}

// ---------- State & actions ----------
const state = { doors: false, windows: false, hood: false, trunk: false, wheels: false, lights: true, engine: false };

function setDoors(open) {
  state.doors = open;
  for (const d of car.doors) d.openDamper.t = open ? d.openAngle : 0;
}
function setWindows(down) {
  state.windows = down;
  for (const d of car.doors) d.glassDamper.t = d.glassBaseY - (down ? 0.26 : 0);
}
function setHood(open) {
  state.hood = open;
  car.hoodDamper.t = open ? -0.85 : 0;
}
function setTrunk(open) {
  state.trunk = open;
  car.trunkDamper.t = open ? 0.9 : 0;
}
function setWheels(removed) {
  state.wheels = removed;
  for (const w of car.wheels) w.damper.t = removed ? w.dir * 0.6 : 0;
}
function setLights(on) {
  state.lights = on;
  car.headMat.emissiveIntensity = on ? 1.4 : 0.05;
  car.tailMat.emissiveIntensity = on ? 0.9 : 0.05;
}
function setEngine(on) {
  state.engine = on;
}
function resetAll() {
  setDoors(false);
  setWindows(false);
  setHood(false);
  setTrunk(false);
  setWheels(false);
  setLights(true);
  setEngine(false);
  view('front');
  updateToolbar();
}

// ---------- Selection ----------
let selection = null;
let currentId = null;

function clearHighlight() {
  if (!selection) return;
  for (const { mat, emissive, intensity } of selection) {
    mat.emissive.setHex(emissive);
    mat.emissiveIntensity = intensity;
  }
  selection = null;
}

function highlight(id) {
  clearHighlight();
  const entries = [];
  car.group.traverse((o) => {
    if (o.isMesh && o.userData.componentId === id && o.material.emissive) {
      entries.push({ mat: o.material, emissive: o.material.emissive.getHex(), intensity: o.material.emissiveIntensity });
      o.material.emissive.setHex(0x2b4bd8);
      o.material.emissiveIntensity = 0.55;
    }
  });
  selection = entries;
}

const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;

stage.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
stage.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  const rect = stage.getBoundingClientRect();
  pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObject(car.group, true);
  for (const hit of hits) {
    let o = hit.object;
    while (o && !o.userData.componentId) o = o.parent;
    if (o) { select(o.userData.componentId); return; }
  }
  deselect();
});

// ---------- Info panel ----------
const panel = document.getElementById('panel');
const panelName = document.getElementById('panel-name');
const panelCat = document.getElementById('panel-cat');
const panelDesc = document.getElementById('panel-desc');
const panelAction = document.getElementById('panel-action');

function labelFor(action) {
  switch (action) {
    case 'hood': return state.hood ? 'Close hood' : 'Open hood';
    case 'trunk': return state.trunk ? 'Close trunk' : 'Open trunk';
    case 'doors': return state.doors ? 'Close all doors' : 'Open all doors';
    case 'windows': return state.windows ? 'Raise windows' : 'Lower windows';
    case 'wheels': return state.wheels ? 'Install wheels' : 'Remove wheels';
    case 'lights': return state.lights ? 'Lights off' : 'Lights on';
    case 'engine': return state.engine ? 'Stop engine' : 'Start engine';
    default: return '';
  }
}

function actionFor(id) {
  const info = lookup(id);
  if (info.action) return info.action;
  if (id.startsWith('vehicle.exterior.door.')) return 'doors';
  if (id.startsWith('vehicle.wheels.')) return 'wheels';
  return null;
}

function runAction(action) {
  if (action === 'hood') setHood(!state.hood);
  else if (action === 'trunk') setTrunk(!state.trunk);
  else if (action === 'doors') setDoors(!state.doors);
  else if (action === 'windows') setWindows(!state.windows);
  else if (action === 'wheels') setWheels(!state.wheels);
  else if (action === 'lights') setLights(!state.lights);
  else if (action === 'engine') setEngine(!state.engine);
  else if (action.startsWith('door:')) {
    const d = car.doors[+action.slice(5)];
    if (d) d.openDamper.t = Math.abs(d.openDamper.t) < 0.01 ? d.openAngle : 0;
  } else if (action.startsWith('wheel:')) {
    const w = car.wheels[+action.slice(6)];
    if (w) w.damper.t = Math.abs(w.damper.t) < 0.01 ? w.dir * 0.6 : 0;
  }
  updateToolbar();
  if (currentId) showPanel(currentId);
}

function focusComponent(id) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  car.group.traverse((o) => {
    if (o.isMesh && o.userData.componentId === id) tmp.setFromObject(o), box.union(tmp);
  });
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.5);
  const dir = center.clone().sub(camera.position).setY(0).normalize();
  if (!dir.lengthSq()) dir.set(0.7, 0, 0.7);
  const pos = center.clone().add(dir.multiplyScalar(radius * 3)).add(new THREE.Vector3(0, radius * 1.2, 0));
  moveCamera([pos.x, pos.y, pos.z], [center.x, center.y, center.z]);
}

function showPanel(id) {
  currentId = id;
  highlight(id);
  const info = lookup(id);
  panelName.textContent = info.name;
  panelCat.textContent = info.category;
  panelDesc.textContent = info.description;
  const action = actionFor(id);
  panelAction.hidden = !action;
  if (action) panelAction.textContent = labelFor(action);
  panelAction.dataset.action = action || '';
  panel.classList.add('open');
}

function select(id) {
  showPanel(id);
  focusComponent(id);
}

function deselect() {
  currentId = null;
  clearHighlight();
  panel.classList.remove('open');
}

panelAction.addEventListener('click', () => runAction(panelAction.dataset.action));
document.getElementById('panel-close').addEventListener('click', deselect);

// ---------- Toolbar & views ----------
const toolbar = document.getElementById('toolbar');

function updateToolbar() {
  for (const btn of toolbar.querySelectorAll('button[data-act]')) {
    const act = btn.dataset.act;
    btn.classList.toggle('on', act !== 'reset' && !!state[act]);
  }
}

toolbar.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'reset') resetAll();
  else runAction(act);
});

document.querySelector('.views').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-view]');
  if (btn) view(btn.dataset.view);
});

// ---------- Animation loop ----------
const clock = new THREE.Clock();
const cabinCenter = new THREE.Vector3(0, 1.1, -0.28);

// Glass fades out when the camera is inside the cabin so interior views
// are not obscured.
const glassMats = [];
car.group.traverse((o) => {
  if (o.isMesh && o.userData.isGlass && !glassMats.includes(o.material)) glassMats.push(o.material);
});
let glassOpacity = 0.35;

function damp(d, dt) {
  d.v = THREE.MathUtils.damp(d.v, d.t, 6, dt);
  d.apply(d.v);
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  damp(car.hoodDamper, dt);
  damp(car.trunkDamper, dt);
  for (const d of car.doors) { damp(d.openDamper, dt); damp(d.glassDamper, dt); }
  for (const w of car.wheels) damp(w.damper, dt);

  // Engine start simulation — visual only, not a physical simulation.
  if (state.engine) {
    car.engineFan.rotation.z += dt * 10;
    car.engineBlock.position.y = car.engineBaseY + Math.sin(clock.elapsedTime * 40) * 0.004;
  } else {
    car.engineBlock.position.y = car.engineBaseY;
  }

  // Glass visibility inside/outside
  const inside = camera.position.distanceTo(cabinCenter) < 2.2;
  glassOpacity = THREE.MathUtils.damp(glassOpacity, inside ? 0.06 : 0.35, 6, dt);
  for (const m of glassMats) m.opacity = glassOpacity;

  if (camLerp) {
    camera.position.lerp(camGoal, 0.08);
    controls.target.lerp(targetGoal, 0.08);
    if (camera.position.distanceTo(camGoal) < 0.03) camLerp = false;
  }

  controls.update();
  renderer.render(scene, camera);
});

updateToolbar();
