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
    description: '1.6L SOHC VTEC inline-four block. Placeholder representation of the D16Y8 shown in this phase.'
  },
  'vehicle.engine.valve_cover': {
    name: 'Valve Cover',
    category: 'Engine',
    description: 'Covers the SOHC valvetrain and VTEC rocker assembly on the cylinder head.'
  },
  'vehicle.engine.radiator': {
    name: 'Radiator',
    category: 'Cooling',
    description: 'Crossflow radiator at the front of the bay with upper and lower hoses (hoses in a later phase).'
  },
  'vehicle.engine.battery': {
    name: 'Battery',
    category: 'Electrical',
    description: '12V battery feeding the main fuse box and starter circuit.'
  },
  'vehicle.interior.dashboard': {
    name: 'Dashboard',
    category: 'Interior',
    description: 'Instrument panel with the gauge cluster above the steering column.'
  },
  'vehicle.interior.steering_wheel': {
    name: 'Steering Wheel',
    category: 'Interior',
    description: 'Three-spoke wheel on the steering column. Rotation interaction planned for a later phase.'
  },
  'vehicle.interior.seats': {
    name: 'Seats',
    category: 'Interior',
    description: 'Front buckets and rear bench. Cabin camera modes planned for a later phase.'
  }
};

export function lookup(id) {
  return COMPONENTS[id] || { name: id, category: 'Component', description: 'Registered vehicle component.' };
}
