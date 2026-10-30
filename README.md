# Civic Ferio EK3 — Interactive 3D Workshop

An interactive 3D pixel-art digital twin of the 1996–2000 Honda Civic Ferio EK3
4-door sedan. Explore the car in the browser: open the doors and trunk, drop
the power windows, pull a wheel, take the brakes apart, explode the D16Y8
engine bay, or sit in the driver's seat.

## Running

No build step. Serve the repository root statically (or use the app's Run) and
open `index.html`. Three.js loads from a CDN via import map, so the viewer
needs network access on first load.

## Features

- Orbitable 3D EK3 sedan with extruded side-profile bodywork (long sloping
  hood, raked greenhouse, high rear deck, inset trunk lid)
- Hood, trunk, all four doors and all four power windows animate on real pivots
- Engine-start visual simulation (fan spin, idle vibration, gauge needles)
- Full engine bay: intake, throttle body, airbox, fuel rail, cooling loop,
  battery, alternator, distributor, oil pan, exhaust manifold, transmission —
  with a controlled exploded view and re-assembly
- Double-wishbone corner assemblies behind every wheel: control arms, coil
  spring, shock, hub, brake disc and caliper
- Dependency-ordered brake service: wheel off → caliper off → disc off
- Steering rack and tie rods, floor pan, exhaust system, fuel tank
- Interior: instrument cluster with animated needles, steering wheel, gear
  selector, handbrake, pedals, head unit, AC panel, dome light
- Component registry (~40 parts) powering tap-to-inspect, a searchable
  component explorer, isolation mode, contextual exploded views, and labels
- Camera presets: front / side / rear / top / engine / suspension / driver
  seat / dashboard / rear seat
- Keyboard shortcuts (desktop): `1`–`6` views, `d` doors, `h` hood, `t` trunk,
  `w` wheels, `l` lights, `e` engine, `x` explode, `r` reset, `Esc` back
- Mobile-first responsive UI: bottom-sheet info panel, compact toolbar,
  touch orbit controls, adaptive render resolution

## Architecture

```
index.html      page shell, import map, UI overlays
styles.css      dark automotive design system, mobile-first
src/main.js     scene, camera system, interaction manager, UI wiring
src/car.js      procedural vehicle model (placeholder geometry)
src/registry.js vehicle component registry — single source of metadata
```

The component registry maps stable IDs (`vehicle.engine.radiator`,
`vehicle.suspension.front_left.brakes`, …) to name/category/description and
available actions. Rendering, state, interaction, and metadata are separated;
the procedural model in `car.js` is a clearly-labelled placeholder awaiting
Blender-authored or licensed EK3 GLB assets — interactions attach to real
asset nodes by the same IDs when they arrive.

## Bringing in a real EK3 model

The viewer has a GLB pipeline: drop `assets/civic-ek3.glb` into the repo and
it loads automatically on start, or tap **3D model** in the top bar and pick
any `.glb`/`.gltf` from the device to swap it in live. Node names map to
component IDs so tap-to-inspect and highlighting keep working:

`body`, `hood`, `trunk`, `roof`, `windshield`, `rear_glass`, `grille`,
`headlights`, `taillights`, `mirrors`, `spoiler`, `dashboard`, `seats`,
`door_front_left`…`door_rear_right`, `wheel_front_left`…`wheel_rear_right`.

Good sources for an EK3 asset:

- **Sketchfab** — search "Honda Civic EK3" / "Civic Ferio EK", filter by
  downloadable (check each model's license before use)
- **Photogrammetry** — the owner's reference photos are ideal input for a
  scan-then-cleanup pass (Meshroom/Luma), exported as GLB
- **Commissioned Blender work** modeled from the reference photo sheet

With the asset in place, the procedural placeholder in `car.js` is replaced
and animations can be re-bound to named pivot nodes by the same IDs.

## Status

Phases 1–6 complete (foundation, exterior, interior, engine, suspension,
advanced interaction). Phase 7 (adaptive quality, loading state, labels) done
as a pass; deeper device/QA matrix and the real GLB asset pipeline remain.

Specifications on the site are reference values for the EK3 and should be
verified against Honda service documentation before relying on them.
