// Scene setup, camera system, interaction manager and UI wiring.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCar } from './car.js';
import { lookup, COMPONENTS } from './registry.js';

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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
// Room environment gives the paint real reflections.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x20242c, 0.35));

const key = new THREE.DirectionalLight(0xffffff, 1.3);
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
let raycastTarget = car.group;

// ---------- Real 3D asset pipeline ----------
// Provide assets/civic-ek3.glb (or load any .glb via the toolbar button)
// and it replaces the procedural placeholder. Node names map to registry
// IDs: hood, trunk, roof, windshield, rear_glass, grille, headlights,
// taillights, mirrors, spoiler, body, dashboard, seats,
// door_front_left…door_rear_right, wheel_front_left…wheel_rear_right.
const NODE_MAP = {
  body: 'vehicle.exterior.body',
  hood: 'vehicle.exterior.hood',
  trunk: 'vehicle.exterior.trunk',
  roof: 'vehicle.exterior.roof',
  windshield: 'vehicle.exterior.windshield',
  rear_glass: 'vehicle.exterior.rear_glass',
  grille: 'vehicle.exterior.grille',
  headlights: 'vehicle.exterior.headlights',
  taillights: 'vehicle.exterior.taillights',
  mirrors: 'vehicle.exterior.mirrors',
  spoiler: 'vehicle.exterior.spoiler',
  dashboard: 'vehicle.interior.dashboard',
  seats: 'vehicle.interior.seats',
  door_front_left: 'vehicle.exterior.door.front_left',
  door_front_right: 'vehicle.exterior.door.front_right',
  door_rear_left: 'vehicle.exterior.door.rear_left',
  door_rear_right: 'vehicle.exterior.door.rear_right',
  wheel_front_left: 'vehicle.wheels.front_left',
  wheel_front_right: 'vehicle.wheels.front_right',
  wheel_rear_left: 'vehicle.wheels.rear_left',
  wheel_rear_right: 'vehicle.wheels.rear_right'
};

const assetBadge = document.getElementById('asset-badge');

function installAsset(gltf) {
  const model = gltf.scene;
  model.traverse((o) => {
    const mapped = NODE_MAP[String(o.name).toLowerCase()];
    if (mapped) o.userData.componentId = mapped;
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.remove(car.group);
  scene.add(model);
  raycastTarget = model;
  deselect();
  assetBadge.hidden = false;
}

function loadAssetFile(file) {
  const url = URL.createObjectURL(file);
  new GLTFLoader().load(url, installAsset, undefined, () => {
    assetBadge.hidden = false;
    assetBadge.textContent = 'Could not read that file — use a .glb/.gltf model.';
    setTimeout(() => { assetBadge.hidden = true; assetBadge.textContent = 'Custom 3D asset loaded — tap parts to inspect. Animations expect named nodes (hood, trunk, door_front_left…).'; }, 4000);
  });
}

// If a real asset ships with the repo, use it instead of the placeholder.
new GLTFLoader().load('assets/civic-ek3.glb', installAsset, undefined, () => {});

document.getElementById('btn-asset').addEventListener('click', () => document.getElementById('asset-input').click());
document.getElementById('asset-input').addEventListener('change', (e) => {
  if (e.target.files[0]) loadAssetFile(e.target.files[0]);
  e.target.value = '';
});

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
  rearseat: { pos: [0, 1.12, -1.0], target: [0, 1.0, 0.5] },
  suspension: { pos: [2.4, 0.7, 1.8], target: [0.5, 0.45, 1.4] }
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
  if (name === 'suspension') {
    // Pull the front-left wheel so the corner assembly is inspectable.
    setWheels(false);
    const fl = car.wheels[0];
    fl.damper.t = fl.dir * 0.6;
  }
  moveCamera(p.pos, p.target);
}

// ---------- State & actions ----------
const state = { doors: false, windows: false, hood: false, trunk: false, wheels: false, lights: true, engine: false, gear: false, handbrake: false, dome: false, headunit: false, ac: false, explode: false };

// Timers and interior dampers
let steerTime = 0;
let revTime = 0;
const steerDamper = { v: 0, t: 0, apply: (v) => { car.steerSpin.rotation.z = v; } };
const speedoDamper = { v: 0, t: 0, apply: (v) => { car.speedoNeedle.rotation.z = v; } };
const tachDamper = { v: 0, t: 0, apply: (v) => { car.tachNeedle.rotation.z = v; } };
// Exploded view: one scalar 0..1 spreads every bay part along its offset.
const explodeDamper = {
  v: 0,
  t: 0,
  apply: (v) => {
    for (const p of car.explodable) {
      p.mesh.position.copy(p.base).addScaledVector(p.off, v * 0.8);
    }
  }
};

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
  if (!on) revTime = 0;
}
function setExplode(on) {
  state.explode = on;
  explodeDamper.t = on ? 1 : 0;
}
function resetAll() {
  setDoors(false);
  setWindows(false);
  setHood(false);
  setTrunk(false);
  setWheels(false);
  setLights(true);
  setEngine(false);
  setExplode(false);
  for (const c of car.suspension) {
    c.explode.t = 0;
    c.service.t = 0;
    c.serviceStep = 0;
  }
  state.gear = false;
  state.handbrake = false;
  state.dome = false;
  state.headunit = false;
  state.ac = false;
  steerTime = 0;
  revTime = 0;
  steerDamper.t = 0;
  car.gearDamper.t = 0;
  car.brakeDamper.t = 0;
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
  raycastTarget.traverse((o) => {
    if (o.isMesh && o.userData.componentId === id && o.material.emissive) {
      // Materials may be shared (body paint); clone once so highlighting
      // only affects the selected part.
      if (!o.material.userData.cloned) {
        o.material = o.material.clone();
        o.material.userData.cloned = true;
      }
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
  const hits = ray.intersectObject(raycastTarget, true);
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
  if (action.startsWith('brakes:')) {
    const c = car.suspension[+action.slice(7)];
    const step = c ? (c.serviceStep || 0) : 0;
    return step === 0 ? 'Remove caliper' : step === 1 ? 'Remove disc' : 'Reinstall brakes';
  }
  if (action.startsWith('sexplode:')) {
    const c = car.suspension[+action.slice(9)];
    return c && c.explode.t > 0 ? 'Reassemble corner' : 'Explode corner';
  }
  switch (action) {
    case 'hood': return state.hood ? 'Close hood' : 'Open hood';
    case 'trunk': return state.trunk ? 'Close trunk' : 'Open trunk';
    case 'doors': return state.doors ? 'Close all doors' : 'Open all doors';
    case 'windows': return state.windows ? 'Raise windows' : 'Lower windows';
    case 'wheels': return state.wheels ? 'Install wheels' : 'Remove wheels';
    case 'lights': return state.lights ? 'Lights off' : 'Lights on';
    case 'engine': return state.engine ? 'Stop engine' : 'Start engine';
    case 'explode': return state.explode ? 'Re-assemble engine' : 'Explode engine bay';
    case 'steer': return 'Turn steering wheel';
    case 'gear': return state.gear ? 'Shift to neutral' : 'Shift gear';
    case 'handbrake': return state.handbrake ? 'Release handbrake' : 'Pull handbrake';
    case 'dome': return state.dome ? 'Dome light off' : 'Dome light on';
    case 'headunit': return state.headunit ? 'Head unit off' : 'Head unit on';
    case 'ac': return state.ac ? 'AC off' : 'AC on';
    case 'rev': return 'Press accelerator';
    default: return '';
  }
}

function actionFor(id) {
  const info = lookup(id);
  if (info.action) return info.action;
  if (id.startsWith('vehicle.suspension.')) {
    const i = car.suspension.findIndex((c) => id.includes('.' + c.corner + '.'));
    return id.endsWith('.brakes') ? 'brakes:' + i : 'sexplode:' + i;
  }
  if (id.startsWith('vehicle.exterior.door.')) return 'doors';
  if (id.startsWith('vehicle.wheels.')) return 'wheels';
  return null;
}

// Pulling a corner apart requires its wheel off first.
function removeWheelFor(corner) {
  const order = ['front_left', 'front_right', 'rear_left', 'rear_right'];
  const wi = order.indexOf(corner.corner);
  if (wi >= 0) car.wheels[wi].damper.t = car.wheels[wi].dir * 0.6;
}

function runAction(action) {
  if (action === 'hood') setHood(!state.hood);
  else if (action === 'trunk') setTrunk(!state.trunk);
  else if (action === 'doors') setDoors(!state.doors);
  else if (action === 'windows') setWindows(!state.windows);
  else if (action === 'wheels') setWheels(!state.wheels);
  else if (action === 'lights') setLights(!state.lights);
  else if (action === 'engine') setEngine(!state.engine);
  else if (action === 'explode') {
    if (currentId && currentId.startsWith('vehicle.suspension.')) {
      const c = car.suspension.find((s) => currentId.includes('.' + s.corner + '.'));
      if (c) {
        c.explode.t = c.explode.t > 0 ? 0 : 1;
        if (c.explode.t > 0) removeWheelFor(c);
      }
    } else {
      setExplode(!state.explode);
    }
  }
  else if (action.startsWith('sexplode:')) {
    const c = car.suspension[+action.slice(9)];
    if (c) {
      c.explode.t = c.explode.t > 0 ? 0 : 1;
      if (c.explode.t > 0) removeWheelFor(c);
    }
  }
  else if (action.startsWith('brakes:')) {
    const c = car.suspension[+action.slice(7)];
    if (c) {
      const w = car.wheels[+action.slice(7)];
      const next = ((c.serviceStep || 0) + 1) % 3;
      c.serviceStep = next;
      c.service.t = next === 0 ? 0 : next === 1 ? 0.4 : 0.9;
      // Dependency: the wheel must come off before the caliper; the
      // caliper must come off before the disc. Reinstall reverses it.
      if (next > 0 && Math.abs(w.damper.t) < 0.01) w.damper.t = w.dir * 0.6;
      if (next === 0) w.damper.t = 0;
    }
  }
  else if (action === 'gear') {
    state.gear = !state.gear;
    car.gearDamper.t = state.gear ? -0.5 : 0;
  } else if (action === 'handbrake') {
    state.handbrake = !state.handbrake;
    car.brakeDamper.t = state.handbrake ? -0.7 : 0;
  } else if (action === 'dome') {
    state.dome = !state.dome;
  } else if (action === 'headunit') {
    state.headunit = !state.headunit;
  } else if (action === 'ac') {
    state.ac = !state.ac;
  } else if (action === 'steer') {
    steerTime = 2.4;
  } else if (action === 'rev') {
    if (state.engine) revTime = 1.6;
  } else if (action.startsWith('door:')) {
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
  raycastTarget.traverse((o) => {
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
  if (isolatedId && isolatedId !== id) setIsolate(false);
  panelIsolate.hidden = !currentId;
  panel.classList.add('open');
}

function select(id) {
  showPanel(id);
  focusComponent(id);
}

function deselect() {
  currentId = null;
  if (isolatedId) setIsolate(false);
  clearHighlight();
  panel.classList.remove('open');
}

panelAction.addEventListener('click', () => runAction(panelAction.dataset.action));
document.getElementById('panel-close').addEventListener('click', deselect);

// ---------- Component search ----------
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchList = document.getElementById('search-list');

function openSearch() {
  searchModal.hidden = false;
  searchInput.value = '';
  renderSearch('');
  searchInput.focus();
}
function closeSearch() {
  searchModal.hidden = true;
}

function renderSearch(q) {
  searchList.innerHTML = '';
  for (const [id, info] of Object.entries(COMPONENTS)) {
    const hay = (info.name + ' ' + info.category + ' ' + id).toLowerCase();
    if (q && !hay.includes(q)) continue;
    const li = document.createElement('li');
    li.textContent = info.name + ' — ' + info.category;
    li.addEventListener('click', () => {
      closeSearch();
      select(id);
    });
    searchList.appendChild(li);
  }
  if (!searchList.children.length) {
    const li = document.createElement('li');
    li.textContent = 'No matching components';
    searchList.appendChild(li);
  }
}

document.getElementById('btn-search').addEventListener('click', openSearch);
document.getElementById('search-close').addEventListener('click', closeSearch);
searchModal.addEventListener('click', (e) => { if (e.target === searchModal) closeSearch(); });
searchInput.addEventListener('input', () => renderSearch(searchInput.value.trim().toLowerCase()));

// ---------- Component isolation ----------
let isolatedId = null;
let hiddenMeshes = [];

function meshComponentId(mesh) {
  let o = mesh;
  while (o && !o.userData.componentId) o = o.parent;
  return o ? o.userData.componentId : null;
}

function setIsolate(on) {
  if (on && currentId) {
    isolatedId = currentId;
    hiddenMeshes = [];
    car.group.traverse((o) => {
      if (o.isMesh && o.visible && meshComponentId(o) !== isolatedId) {
        o.visible = false;
        hiddenMeshes.push(o);
      }
    });
    panelIsolate.textContent = 'Show all';
  } else {
    for (const m of hiddenMeshes) m.visible = true;
    hiddenMeshes = [];
    isolatedId = null;
    panelIsolate.textContent = 'Isolate';
  }
  panelIsolate.hidden = !currentId;
}
const panelIsolate = document.getElementById('panel-isolate');
panelIsolate.addEventListener('click', () => setIsolate(!isolatedId));

// ---------- Keyboard shortcuts (desktop) ----------
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  const viewKeys = { '1': 'front', '2': 'side', '3': 'rear', '4': 'top', '5': 'engine', '6': 'suspension' };
  if (viewKeys[k]) view(viewKeys[k]);
  else if (k === 'd') runAction('doors');
  else if (k === 'h') runAction('hood');
  else if (k === 't') runAction('trunk');
  else if (k === 'w') runAction('wheels');
  else if (k === 'l') runAction('lights');
  else if (k === 'e') runAction('engine');
  else if (k === 'x') runAction('explode');
  else if (k === 'r') resetAll();
  else if (k === 'escape') {
    if (!searchModal.hidden) closeSearch();
    else deselect();
  }
});

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

// ---------- Exploded-view labels ----------
// Floating name tags appear on exploded parts (lazy-created, cached by text).
const labelTexCache = new Map();

function labelTexture(text) {
  if (labelTexCache.has(text)) return labelTexCache.get(text);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(11, 13, 18, 0.85)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = 'bold 26px -apple-system, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34, 240);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  labelTexCache.set(text, tex);
  return tex;
}

const labelTargets = [];
for (const p of car.explodable) {
  if (p.mesh.userData.componentId && p.mesh.userData.componentId !== 'vehicle.engine.block') {
    labelTargets.push({ mesh: p.mesh, id: p.mesh.userData.componentId, getExplode: () => explodeDamper.v });
  }
}
for (const c of car.suspension) {
  for (const p of c.parts) {
    if (p.cat !== 'arms') {
      labelTargets.push({ mesh: p.mesh, id: p.mesh.userData.componentId, getExplode: () => c.explode.v });
    }
  }
}

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
let slowFrames = 0;

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
  const revving = revTime > 0;
  const revBoost = revving ? 3 : 1;
  if (state.engine) {
    car.engineFan.rotation.z += dt * 10 * revBoost;
    car.engineBlock.position.y = car.engineBaseY + Math.sin(clock.elapsedTime * 40) * 0.004 * revBoost;
  } else {
    car.engineBlock.position.y = car.engineBaseY;
  }

  damp(explodeDamper, dt);

  // Suspension corners: explode offsets + brake-service slides
  for (const c of car.suspension) {
    c.explode.v = THREE.MathUtils.damp(c.explode.v, c.explode.t, 6, dt);
    c.service.v = THREE.MathUtils.damp(c.service.v, c.service.t, 6, dt);
    for (const p of c.parts) {
      p.mesh.position.copy(p.base).addScaledVector(p.off, c.explode.v);
      if (p.slide) p.mesh.position.x += c.side * p.slide * c.service.v;
    }
  }

  // Steering wheel turn-and-center animation
  if (steerTime > 0) {
    steerTime = Math.max(0, steerTime - dt);
    steerDamper.t = steerTime > 0 ? Math.sin((2.4 - steerTime) * 2.6) * 1.2 : 0;
  }
  damp(steerDamper, dt);

  // Gauge needles follow engine state and throttle
  revTime = Math.max(0, revTime - dt);
  speedoDamper.t = state.engine ? (revving ? 2.4 : 1.4) : 0;
  tachDamper.t = state.engine ? (revving ? 2.2 : 0.7) : 0;
  damp(speedoDamper, dt);
  damp(tachDamper, dt);

  // Accelerator pedal dips while revving
  car.accelDamper.t = revving ? -0.35 : 0;
  damp(car.accelDamper, dt);

  // Illumination follows its state
  car.clusterMat.emissiveIntensity = THREE.MathUtils.damp(car.clusterMat.emissiveIntensity, state.engine ? 1 : 0.12, 6, dt);
  car.headUnitMat.emissiveIntensity = THREE.MathUtils.damp(car.headUnitMat.emissiveIntensity, state.headunit ? 1.2 : 0.06, 6, dt);
  car.domeMat.emissiveIntensity = THREE.MathUtils.damp(car.domeMat.emissiveIntensity, state.dome ? 1.2 : 0.05, 6, dt);
  car.domePoint.intensity = THREE.MathUtils.damp(car.domePoint.intensity, state.dome ? 2 : 0, 6, dt);

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

  // Adaptive quality: if frames run slow, step the render resolution down.
  if (dt > 0.033) slowFrames++;
  else slowFrames = Math.max(0, slowFrames - 2);
  if (slowFrames > 90 && renderer.getPixelRatio() > 1) {
    renderer.setPixelRatio(renderer.getPixelRatio() - 0.5);
    slowFrames = 0;
  }

  // Exploded-view labels: lazily created, visible only while exploded.
  for (const t of labelTargets) {
    const show = t.getExplode() > 0.4;
    if (!t.sprite && show) {
      t.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(lookup(t.id).name), depthTest: false, transparent: true }));
      t.sprite.scale.set(0.9, 0.225, 1);
      t.sprite.position.set(0, 0.3, 0);
      t.sprite.renderOrder = 999;
      t.mesh.add(t.sprite);
    }
    if (t.sprite) t.sprite.visible = show;
  }
});

// Everything wired — reveal the scene.
document.getElementById('loading').remove();

updateToolbar();
