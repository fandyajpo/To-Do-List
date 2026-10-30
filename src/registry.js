// Vehicle Component Registry — single source of truth for part metadata.
// Every selectable part of the car references an id defined here.

export const COMPONENTS = {
  'vehicle.exterior.body': {
    name: 'Body Shell',
    category: 'Exterior',
    description: 'Four-door sedan monocoque with EK-generation proportions. Placeholder geometry.'
  },
  'vehicle.exterior.hood': {
    name: 'Hood',
    category: 'Exterior',
    description: 'Front hood panel, hinged at the cowl. Opens to reveal the engine bay.',
    action: 'hood'
  },
  'vehicle.exterior.trunk': {
    name: 'Trunk Lid',
    category: 'Exterior',
    description: 'Rear trunk lid, hinged at its forward edge. Opens the luggage compartment.',
    action: 'trunk'
  },
  'vehicle.exterior.roof': {
    name: 'Roof Panel',
    category: 'Exterior',
    description: 'Steel roof panel with the EK sedan roofline.'
  },
  'vehicle.exterior.windshield': {
    name: 'Windshield',
    category: 'Glass',
    description: 'Laminated front windscreen. Placeholder stylized glass.'
  },
  'vehicle.exterior.rear_glass': {
    name: 'Rear Windshield',
    category: 'Glass',
    description: 'Tempered rear windscreen with stylized defogger lines.'
  },
  'vehicle.exterior.grille': {
    name: 'Grille & Emblem',
    category: 'Exterior',
    description: 'Front grille with the Honda emblem between the headlamps.'
  },
  'vehicle.exterior.headlights': {
    name: 'Headlamps',
    category: 'Lighting',
    description: 'Left and right headlamp assemblies with low/high beam styling.',
    action: 'lights'
  },
  'vehicle.exterior.taillights': {
    name: 'Tail Lamps',
    category: 'Lighting',
    description: 'Rear combination lamps: brake, tail and turn signal sections.',
    action: 'lights'
  },
  'vehicle.exterior.mirrors': {
    name: 'Door Mirrors',
    category: 'Exterior',
    description: 'Exterior door mirrors on the front door frames.'
  },
  'vehicle.exterior.door.front_left': {
    name: 'Front Left Door',
    category: 'Doors',
    description: 'Front-left door shell on its hinge. Tap the toolbar to open or close all doors.',
    action: 'door:0'
  },
  'vehicle.exterior.door.front_right': {
    name: 'Front Right Door',
    category: 'Doors',
    description: 'Front-right door shell on its hinge.',
    action: 'door:1'
  },
  'vehicle.exterior.door.rear_left': {
    name: 'Rear Left Door',
    category: 'Doors',
    description: 'Rear-left door shell on its hinge.',
    action: 'door:2'
  },
  'vehicle.exterior.door.rear_right': {
    name: 'Rear Right Door',
    category: 'Doors',
    description: 'Rear-right door shell on its hinge.',
    action: 'door:3'
  },
  'vehicle.wheels.front_left': {
    name: 'Front Left Wheel',
    category: 'Wheels',
    description: 'Tire, rim and hub assembly. Remove it to inspect the hub (later phases: brake and suspension detail).',
    action: 'wheel:0'
  },
  'vehicle.wheels.front_right': {
    name: 'Front Right Wheel',
    category: 'Wheels',
    description: 'Tire, rim and hub assembly.',
    action: 'wheel:1'
  },
  'vehicle.wheels.rear_left': {
    name: 'Rear Left Wheel',
    category: 'Wheels',
    description: 'Tire, rim and hub assembly.',
    action: 'wheel:2'
  },
  'vehicle.wheels.rear_right': {
    name: 'Rear Right Wheel',
    category: 'Wheels',
    description: 'Tire, rim and hub assembly.',
    action: 'wheel:3'
  },
  'vehicle.engine.block': {
    name: 'Engine Block — D16Y8',
    category: 'Engine',
    description: '1.6L SOHC VTEC inline-four block. Start/stop runs a visual idle simulation (fan spin, subtle vibration) — not a physical simulation.',
    action: 'engine'
  },
  'vehicle.engine.valve_cover': {
    name: 'Valve Cover',
    category: 'Engine',
    description: 'Covers the SOHC valvetrain and VTEC rocker assembly on the cylinder head.',
    action: 'engine'
  },
  'vehicle.engine.radiator': {
    name: 'Radiator',
    category: 'Cooling',
    description: 'Crossflow radiator at the front of the bay with upper and lower hoses (hoses in a later phase).'
  },
  'vehicle.engine.battery': {
    name: 'Battery',
    category: 'Electrical',
    description: '12V battery feeding the main fuse box and starter circuit.',
    action: 'explode'
  },
  'vehicle.engine.intake_manifold': {
    name: 'Intake Manifold',
    category: 'Intake',
    description: 'Manifold delivering air to the cylinder head. On the D16, it faces the radiator side.',
    action: 'explode'
  },
  'vehicle.engine.throttle_body': {
    name: 'Throttle Body',
    category: 'Intake',
    description: 'Butterfly valve between the intake pipe and manifold; the cable-driven D16 unit.',
    action: 'explode'
  },
  'vehicle.engine.air_filter': {
    name: 'Air Filter Box',
    category: 'Intake',
    description: 'Filtered air intake box feeding the throttle body.',
    action: 'explode'
  },
  'vehicle.engine.fuel_rail': {
    name: 'Fuel Rail & Injectors',
    category: 'Fuel',
    description: 'Delivers pressurized fuel to the four injectors.',
    action: 'explode'
  },
  'vehicle.engine.radiator_hose': {
    name: 'Radiator Upper Hose',
    category: 'Cooling',
    description: 'Carries hot coolant from the head to the radiator inlet.',
    action: 'explode'
  },
  'vehicle.engine.coolant_reservoir': {
    name: 'Coolant Reservoir',
    category: 'Cooling',
    description: 'Overflow/expansion reservoir for the cooling loop.',
    action: 'explode'
  },
  'vehicle.engine.alternator': {
    name: 'Alternator',
    category: 'Electrical',
    description: 'Belt-driven generator charging the battery and running the electrics.',
    action: 'explode'
  },
  'vehicle.engine.distributor': {
    name: 'Distributor',
    category: 'Ignition',
    description: 'Routes spark from the coil to the spark plugs in firing order (OBD-I style).',
    action: 'explode'
  },
  'vehicle.engine.oil_pan': {
    name: 'Oil Pan',
    category: 'Lubrication',
    description: 'Sump holding engine oil, pick-up below.',
    action: 'explode'
  },
  'vehicle.engine.exhaust_manifold': {
    name: 'Exhaust Manifold',
    category: 'Exhaust',
    description: '4-into-1 collector on the firewall side, feeding the downpipe.',
    action: 'explode'
  },
  'vehicle.engine.transmission': {
    name: 'Transmission',
    category: 'Drivetrain',
    description: 'Five-speed manual gearbox housing on the driver side of the bay (placeholder).',
    action: 'explode'
  },
  'vehicle.interior.dashboard': {
    name: 'Dashboard',
    category: 'Interior',
    description: 'Instrument panel with the gauge cluster above the steering column.'
  },
  'vehicle.interior.instrument_cluster': {
    name: 'Instrument Cluster',
    category: 'Interior',
    description: 'Speedometer and tachometer with illumination. The needles animate with the engine-start simulation.',
    action: 'engine'
  },
  'vehicle.interior.steering_wheel': {
    name: 'Steering Wheel',
    category: 'Interior',
    description: 'Three-spoke wheel on the steering column. Tap the action to see it turn and self-center (visual simulation).',
    action: 'steer'
  },
  'vehicle.interior.console': {
    name: 'Center Console',
    category: 'Interior',
    description: 'Console between the front seats housing the gear lever and handbrake.'
  },
  'vehicle.interior.gear_selector': {
    name: 'Gear Selector',
    category: 'Interior',
    description: 'Manual shifter with boot and knob. Tap the action to shift.',
    action: 'gear'
  },
  'vehicle.interior.handbrake': {
    name: 'Handbrake',
    category: 'Interior',
    description: 'Lever-style parking brake between the seats.',
    action: 'handbrake'
  },
  'vehicle.interior.pedals.accelerator': {
    name: 'Accelerator Pedal',
    category: 'Interior',
    description: 'Throttle pedal. With the engine running, press it for a rev.',
    action: 'rev'
  },
  'vehicle.interior.pedals.brake': {
    name: 'Brake Pedal',
    category: 'Interior',
    description: 'Service brake pedal feeding the master cylinder.'
  },
  'vehicle.interior.pedals.clutch': {
    name: 'Clutch Pedal',
    category: 'Interior',
    description: 'Clutch pedal for the manual gearbox.'
  },
  'vehicle.interior.head_unit': {
    name: 'Head Unit',
    category: 'Interior',
    description: 'Audio head unit with display. Toggle its screen on and off.',
    action: 'headunit'
  },
  'vehicle.interior.ac_controls': {
    name: 'AC Control Panel',
    category: 'Interior',
    description: 'Climate controls: fan speed, temperature and airflow mode.',
    action: 'ac'
  },
  'vehicle.interior.dome_light': {
    name: 'Dome Light',
    category: 'Lighting',
    description: 'Interior roof light. Toggle it on to illuminate the cabin.',
    action: 'dome'
  },
  'vehicle.interior.seats': {
    name: 'Front Seats',
    category: 'Interior',
    description: 'Driver and passenger buckets with headrests.'
  },
  'vehicle.interior.rear_bench': {
    name: 'Rear Bench',
    category: 'Interior',
    description: 'Rear seat cushion and backrest.'
  }
};

// Suspension per-corner entries (double-wishbone placeholder)
for (const corner of ['front_left', 'front_right', 'rear_left', 'rear_right']) {
  const label = corner.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  COMPONENTS[`vehicle.suspension.${corner}.arms`] = {
    name: `${label} control arms`,
    category: 'Suspension',
    description: 'Upper and lower control arms of the double-wishbone setup (placeholder geometry).'
  };
  COMPONENTS[`vehicle.suspension.${corner}.coil`] = {
    name: `${label} coil spring & shock`,
    category: 'Suspension',
    description: 'Coil spring and damper assembly riding on the control arm.'
  };
  COMPONENTS[`vehicle.suspension.${corner}.brakes`] = {
    name: `${label} brakes`,
    category: 'Braking',
    description: 'Brake disc and caliper behind the wheel. Remove the wheel to see them.'
  };
  COMPONENTS[`vehicle.suspension.${corner}.hub`] = {
    name: `${label} hub`,
    category: 'Suspension',
    description: 'Wheel hub and bearing carrier.'
  };
}
COMPONENTS['vehicle.steering.rack'] = {
  name: 'Steering rack',
  category: 'Steering',
  description: 'Rack housing connecting both front steering knuckles.'
};
COMPONENTS['vehicle.steering.tie_rods'] = {
  name: 'Tie rods',
  category: 'Steering',
  description: 'Inner and outer tie rods linking the rack to the knuckles.'
};
COMPONENTS['vehicle.undercarriage.floor_pan'] = {
  name: 'Floor pan',
  category: 'Undercarriage',
  description: 'Main underbody floor structure between the axles.'
};
COMPONENTS['vehicle.undercarriage.exhaust'] = {
  name: 'Exhaust system',
  category: 'Undercarriage',
  description: 'Piping and muffler running from the manifold to the rear tip.'
};
COMPONENTS['vehicle.undercarriage.fuel_tank'] = {
  name: 'Fuel tank',
  category: 'Undercarriage',
  description: 'Rear-mounted fuel tank with in-tank pump (placeholder).'
};

export function lookup(id) {
  if (COMPONENTS[id]) return COMPONENTS[id];
  const label = id.startsWith('node:') ? id.slice(5).replace(/_/g, ' ') : id;
  return {
    name: label,
    category: 'Asset node',
    description: 'Named part of the loaded 3D asset. Mapping it in NODE_MAP gives it registry metadata — note this name down for animation binding.'
  };
}
