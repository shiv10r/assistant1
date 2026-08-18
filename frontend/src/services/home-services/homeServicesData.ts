// VSR Home Services — demo fixtures. Every price, availability and booking rule is
// presentation-only here; in production the .NET backend is authoritative for
// pricing, availability, booking status, assignment, refunds, commission and payouts.

// ---------------------------------------------------------------------------
// Location model (doc #20, #105)
// ---------------------------------------------------------------------------

export type Locality = {
  id: string
  name: string
  pincode: string
}

export type City = {
  id: string
  name: string
  zones: readonly string[]
  localities: readonly Locality[]
}

export const CITIES: readonly City[] = [
  {
    id: 'del',
    name: 'Delhi',
    zones: ['Central Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North Delhi'],
    localities: [
      { id: 'del-01', name: 'Connaught Place', pincode: '110001' },
      { id: 'del-02', name: 'Karol Bagh', pincode: '110005' },
      { id: 'del-03', name: 'Lajpat Nagar', pincode: '110024' },
      { id: 'del-04', name: 'Saket', pincode: '110017' },
      { id: 'del-05', name: 'Dwarka Sector 12', pincode: '110078' },
      { id: 'del-06', name: 'Rohini Sector 9', pincode: '110085' },
      { id: 'del-07', name: 'Mayur Vihar Phase 1', pincode: '110091' },
      { id: 'del-08', name: 'Janakpuri', pincode: '110058' },
      { id: 'del-09', name: 'Vasant Kunj', pincode: '110070' },
      { id: 'del-10', name: 'Pitampura', pincode: '110034' },
    ],
  },
  {
    id: 'ggn',
    name: 'Gurugram',
    zones: ['Gurugram Central', 'Sector 14', 'Sector 56', 'Sohna Road', 'Golf Course Road'],
    localities: [
      { id: 'ggn-01', name: 'Sector 14', pincode: '122001' },
      { id: 'ggn-02', name: 'Sector 17', pincode: '122001' },
      { id: 'ggn-03', name: 'Sector 45', pincode: '122003' },
      { id: 'ggn-04', name: 'Sector 56', pincode: '122011' },
      { id: 'ggn-05', name: 'DLF Phase 2', pincode: '122002' },
      { id: 'ggn-06', name: 'Sohna Road', pincode: '122018' },
      { id: 'ggn-07', name: 'Golf Course Road', pincode: '122002' },
      { id: 'ggn-08', name: 'Palam Vihar', pincode: '122017' },
    ],
  },
  {
    id: 'noida',
    name: 'Noida',
    zones: ['Sector 62', 'Sector 18', 'Greater Noida West', 'Sector 76', 'Sector 128'],
    localities: [
      { id: 'noida-01', name: 'Sector 18', pincode: '201301' },
      { id: 'noida-02', name: 'Sector 62', pincode: '201309' },
      { id: 'noida-03', name: 'Sector 76', pincode: '201301' },
      { id: 'noida-04', name: 'Sector 128', pincode: '201304' },
      { id: 'noida-05', name: 'Sector 137', pincode: '201305' },
      { id: 'noida-06', name: 'Greater Noida West', pincode: '201306' },
      { id: 'noida-07', name: 'Sector 44', pincode: '201303' },
    ],
  },
  {
    id: 'ghz',
    name: 'Ghaziabad',
    zones: ['Indirapuram', 'Vaishali', 'Raj Nagar', 'Crossings Republik', 'Kaushambi'],
    localities: [
      { id: 'ghz-01', name: 'Indirapuram', pincode: '201014' },
      { id: 'ghz-02', name: 'Vaishali', pincode: '201010' },
      { id: 'ghz-03', name: 'Raj Nagar', pincode: '201002' },
      { id: 'ghz-04', name: 'Crossings Republik', pincode: '201016' },
      { id: 'ghz-05', name: 'Kaushambi', pincode: '201010' },
      { id: 'ghz-06', name: 'Vasundhara', pincode: '201012' },
    ],
  },
  {
    id: 'fbd',
    name: 'Faridabad',
    zones: ['Sector 15', 'Sector 21C', 'Old Faridabad', 'Neharpar', 'Sector 86'],
    localities: [
      { id: 'fbd-01', name: 'Sector 15', pincode: '121007' },
      { id: 'fbd-02', name: 'Sector 21C', pincode: '121001' },
      { id: 'fbd-03', name: 'Old Faridabad', pincode: '121002' },
      { id: 'fbd-04', name: 'Neharpar Faridabad', pincode: '121004' },
      { id: 'fbd-05', name: 'Sector 86', pincode: '121002' },
      { id: 'fbd-06', name: 'Ballabgarh', pincode: '121004' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Service catalog (doc #31-#47, #103)
// ---------------------------------------------------------------------------

export type ServiceCategory = {
  id: string
  name: string
  slug: string
  tagline: string
  image: string
  gradient: string
}

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  { id: 'cat-elec', name: 'Electrician', slug: 'electrician', tagline: 'Repairs, installations & safety checks', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#F59E0B 0%,#DC2626 100%)' },
  { id: 'cat-plumb', name: 'Plumber', slug: 'plumber', tagline: 'Leaks, blocks, fittings & geysers', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#0EA5E9 0%,#1E3A8A 100%)' },
  { id: 'cat-ac', name: 'AC Service & Repair', slug: 'ac-service', tagline: 'Cleaning, gas refill, repair & installation', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#06B6D4 0%,#0F766E 100%)' },
  { id: 'cat-app', name: 'Appliance Repair', slug: 'appliance-repair', tagline: 'Washing machines, fridges, microwaves & more', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#8B5CF6 0%,#4F46E5 100%)' },
  { id: 'cat-clean', name: 'Cleaning & Pest Control', slug: 'cleaning', tagline: 'Deep cleaning, sanitisation & pest treatment', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#10B981 0%,#065F46 100%)' },
  { id: 'cat-paint', name: 'Painter', slug: 'painter', tagline: 'Walls, woodwork & complete home painting', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#EC4899 0%,#7C3AED 100%)' },
  { id: 'cat-carp', name: 'Carpenter', slug: 'carpenter', tagline: 'Doors, locks, furniture assembly & repair', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#B45309 0%,#78350F 100%)' },
  { id: 'cat-water', name: 'Waterproofing & Home Care', slug: 'waterproofing', tagline: 'Waterproofing, grouting & home maintenance', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&h=400&q=80', gradient: 'linear-gradient(135deg,#0D9488 0%,#164E63 100%)' },
]

export type HomeServicePackage = {
  id: string
  name: 'Basic' | 'Standard' | 'Premium'
  basePrice: number
  durationMins: number
  inclusions: readonly string[]
  exclusions: readonly string[]
}

export type HomeService = {
  id: string
  categoryId: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  image: string
  isEmergency: boolean
  needsInspection: boolean
  inspectionFee: number
  warranty: { label: string; months: number } | null
  packages: readonly HomeServicePackage[]
}

export const SERVICE_ADDONS: readonly { id: string; name: string; price: number }[] = [
  { id: 'add-01', name: 'Additional unit', price: 499 },
  { id: 'add-02', name: 'Extra hour', price: 350 },
  { id: 'add-03', name: 'Material cost (consumables)', price: 250 },
  { id: 'add-04', name: 'Disposal / debris removal', price: 200 },
  { id: 'add-05', name: 'Weekend / after-hours visit', price: 300 },
  { id: 'add-06', name: 'High-rise access (above 4th floor)', price: 200 },
  { id: 'add-07', name: 'Two-visit service (parts not in stock)', price: 0 },
  { id: 'add-08', name: 'Extended warranty', price: 599 },
]

export const SERVICES: readonly HomeService[] = [
  // Electrician
  { id: 'svc-elec-01', categoryId: 'cat-elec', name: 'Switch, Socket & Fitting Repair', slug: 'switch-socket-repair', shortDescription: 'Repair or replace switches, sockets, regulators and light points.', longDescription: 'Our certified electrician visits your home, diagnoses the fault, repairs or replaces switches/sockets and verifies safe wiring. All new components are charged at actuals with prior approval.', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-elec-01-b', name: 'Basic', basePrice: 299, durationMins: 60, inclusions: ['Diagnosis of up to 3 points', 'Repair of up to 3 switches/sockets', 'Safety check of repaired points'], exclusions: ['Replacement components', 'Wiring work'] },
    { id: 'pkg-elec-01-s', name: 'Standard', basePrice: 499, durationMins: 90, inclusions: ['Diagnosis of up to 6 points', 'Repair + replacement of up to 6 points', 'Components up to ₹300', 'Safety check'], exclusions: ['Major rewiring'] },
    { id: 'pkg-elec-01-p', name: 'Premium', basePrice: 799, durationMins: 150, inclusions: ['Whole-home point check', 'Repair + replacement (any count)', 'Components up to ₹800', 'Trip/load balancing check'], exclusions: ['Rewiring of circuits'] },
  ] },
  { id: 'svc-elec-02', categoryId: 'cat-elec', name: 'MCB, Fuse & Circuit Breaker', slug: 'mcb-fuse-repair', shortDescription: 'Frequent tripping, burnt MCBs and overloaded circuits fixed safely.', longDescription: 'We locate the source of trips, replace faulty MCBs/fuses and balance the circuit load. Safety-first approach with full load testing after repair.', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: true, needsInspection: true, inspectionFee: 249, warranty: { label: '45-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-elec-02-b', name: 'Basic', basePrice: 399, durationMins: 90, inclusions: ['Trip diagnosis', 'Single MCB replacement (upto ₹400)', 'Load testing'], exclusions: ['Circuit rewiring'] },
    { id: 'pkg-elec-02-s', name: 'Standard', basePrice: 699, durationMins: 150, inclusions: ['Full DB inspection', 'Up to 4 MCB replacements', 'Components up to ₹800', 'Load balancing'], exclusions: ['DB board replacement'] },
    { id: 'pkg-elec-02-p', name: 'Premium', basePrice: 1199, durationMins: 240, inclusions: ['Whole-home circuit audit', 'DB upgrade support', 'Components up to ₹2000', 'Earthing check'], exclusions: ['DB board material'] },
  ] },
  { id: 'svc-elec-03', categoryId: 'cat-elec', name: 'Fan Repair & Replacement', slug: 'fan-repair', shortDescription: 'Regulator faults, noise, wobble and ceiling fan installation.', longDescription: 'From regulator calibration to full ceiling fan installation, our electrician handles ceiling, pedestal and exhaust fans with a clean finish.', image: 'https://images.unsplash.com/photo-1619154690891-5d384d4a7c4f?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-elec-03-b', name: 'Basic', basePrice: 349, durationMins: 60, inclusions: ['Fan noise/wobble repair', 'Regulator repair', 'Capacitor replacement (up to ₹150)'], exclusions: ['Fan replacement'] },
    { id: 'pkg-elec-03-s', name: 'Standard', basePrice: 599, durationMins: 90, inclusions: ['Complete fan service', 'New fan installation (up to 3)', 'Components up to ₹400'], exclusions: ['Fan cost'] },
    { id: 'pkg-elec-03-p', name: 'Premium', basePrice: 999, durationMins: 180, inclusions: ['Multiple fan repairs/installations', 'Components up to ₹900', 'Wiring check for fan points'], exclusions: ['Fan cost'] },
  ] },
  { id: 'svc-elec-04', categoryId: 'cat-elec', name: 'Emergency Electrical Repair', slug: 'emergency-electrician', shortDescription: 'Power outage, sparking, burning smell or shock — immediate response.', longDescription: 'Priority 90-minute response for dangerous electrical faults. Our emergency team arrives with safety equipment and resolves the hazard, then advises on permanent fixes.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: true, needsInspection: true, inspectionFee: 349, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-elec-04-b', name: 'Basic', basePrice: 749, durationMins: 120, inclusions: ['90-min priority response', 'Hazard isolation & repair', 'Components up to ₹500'], exclusions: ['Major rewiring'] },
    { id: 'pkg-elec-04-s', name: 'Standard', basePrice: 1199, durationMins: 180, inclusions: ['90-min priority response', 'Hazard isolation & repair', 'Components up to ₹1500', 'DB circuit check'], exclusions: ['Rewiring'] },
    { id: 'pkg-elec-04-p', name: 'Premium', basePrice: 1999, durationMins: 300, inclusions: ['Priority response + full DB audit', 'Components up to ₹3000', 'Earthing test & report'], exclusions: ['DB board'] },
  ] },
  { id: 'svc-elec-05', categoryId: 'cat-elec', name: 'Home Wiring & Rewiring', slug: 'home-wiring', shortDescription: 'Point additions, modular wiring and complete rewiring estimates.', longDescription: 'Plan new points, shift switchboards or rewire entire rooms. Work is planned, executed and tested against safety standards with a full handover report.', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 499, warranty: { label: '6-month workmanship warranty', months: 6 }, packages: [
    { id: 'pkg-elec-05-b', name: 'Basic', basePrice: 1499, durationMins: 300, inclusions: ['Inspection & estimate', 'Up to 5 new points', 'Conduit wiring (per plan)'], exclusions: ['Board & switchgear cost'] },
    { id: 'pkg-elec-05-s', name: 'Standard', basePrice: 2999, durationMins: 480, inclusions: ['Room-wise rewiring', 'Up to 12 new points', 'Switchboard relocation support'], exclusions: ['Switchgear cost'] },
    { id: 'pkg-elec-05-p', name: 'Premium', basePrice: 5999, durationMins: 720, inclusions: ['Complete home rewiring', 'DB upgrade + earthing check', '3D point plan + report'], exclusions: ['Switchgear cost'] },
  ] },
  { id: 'svc-elec-06', categoryId: 'cat-elec', name: 'Inverter & Stabilizer Service', slug: 'inverter-service', shortDescription: 'Battery check, inverter repair and stabilizer installation.', longDescription: 'Keep your power backup healthy with battery health checks, inverter servicing and stabilizer fitting for sensitive appliances.', image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-elec-06-b', name: 'Basic', basePrice: 399, durationMins: 90, inclusions: ['Battery health check', 'Inverter cleaning & terminal service'], exclusions: ['Battery replacement'] },
    { id: 'pkg-elec-06-s', name: 'Standard', basePrice: 699, durationMins: 150, inclusions: ['Full inverter service', 'Stabilizer installation', 'Battery water top-up'], exclusions: ['Battery cost'] },
    { id: 'pkg-elec-06-p', name: 'Premium', basePrice: 1199, durationMins: 240, inclusions: ['Inverter + battery + stabilizer audit', 'Load test report', 'Components up to ₹600'], exclusions: ['Battery cost'] },
  ] },

  // Plumber
  { id: 'svc-plumb-01', categoryId: 'cat-plumb', name: 'Tap, Mixer & Bathroom Fittings', slug: 'tap-mixer-repair', shortDescription: 'Dripping taps, leaking mixers and new fitting installation.', longDescription: 'Stop water wastage with fast tap, mixer and bathroom fitting repair. Includes washer replacement, cartridge repair and new fitting installation.', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-plumb-01-b', name: 'Basic', basePrice: 299, durationMins: 60, inclusions: ['Up to 2 tap/mixer repairs', 'Washer/cartridge replacement'], exclusions: ['New fitting cost'] },
    { id: 'pkg-plumb-01-s', name: 'Standard', basePrice: 549, durationMins: 120, inclusions: ['Up to 4 fittings repaired', 'New tap/mixer installation (1)', 'Components up to ₹300'], exclusions: ['Fitting cost'] },
    { id: 'pkg-plumb-01-p', name: 'Premium', basePrice: 899, durationMins: 210, inclusions: ['Whole-bathroom fitting service', 'Up to 3 new installations', 'Components up to ₹700'], exclusions: ['Fitting cost'] },
  ] },
  { id: 'svc-plumb-02', categoryId: 'cat-plumb', name: 'Drain & Sink Blockage', slug: 'drain-blockage', shortDescription: 'Clogged kitchen sinks, basins and bathroom drains cleared.', longDescription: 'Machine-assisted drain clearing for kitchen sinks, basins, floor traps and bathroom drains. Includes root-cause advice to prevent recurrence.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: true, needsInspection: false, inspectionFee: 0, warranty: { label: '7-day blockage-free warranty', months: 0 }, packages: [
    { id: 'pkg-plumb-02-b', name: 'Basic', basePrice: 399, durationMins: 90, inclusions: ['Single drain/sink clearing', 'Chemical-free mechanical clearing'], exclusions: ['Pipe replacement'] },
    { id: 'pkg-plumb-02-s', name: 'Standard', basePrice: 649, durationMins: 150, inclusions: ['Up to 3 blocked points', 'Machine jetting service'], exclusions: ['Pipe replacement'] },
    { id: 'pkg-plumb-02-p', name: 'Premium', basePrice: 999, durationMins: 240, inclusions: ['Whole-home drain network check', 'All blockages cleared', 'Camera inspection advice'], exclusions: ['Pipe replacement'] },
  ] },
  { id: 'svc-plumb-03', categoryId: 'cat-plumb', name: 'Water Tank & Pipe Leakage', slug: 'tank-pipe-leak', shortDescription: 'Overhead tank, supply line and concealed pipe leak detection.', longDescription: 'Detect and fix water leakage from tanks, exposed and concealed pipes using non-destructive methods where possible.', image: 'https://images.unsplash.com/photo-1620916297397-4e540f7a2b0b?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: true, needsInspection: true, inspectionFee: 299, warranty: { label: '60-day leak-free warranty', months: 2 }, packages: [
    { id: 'pkg-plumb-03-b', name: 'Basic', basePrice: 599, durationMins: 150, inclusions: ['Leak detection (visible lines)', 'Single joint/pipe repair', 'Components up to ₹400'], exclusions: ['Concealed pipe re-routing'] },
    { id: 'pkg-plumb-03-s', name: 'Standard', basePrice: 999, durationMins: 240, inclusions: ['Leak detection incl. concealed', 'Up to 3 repairs', 'Components up to ₹900'], exclusions: ['Wall breaking & re-plastering'] },
    { id: 'pkg-plumb-03-p', name: 'Premium', basePrice: 1799, durationMins: 420, inclusions: ['Full plumbing network audit', 'All leaks fixed', 'Tank cleaning + repair', 'Components up to ₹2000'], exclusions: ['Structural work'] },
  ] },
  { id: 'svc-plumb-04', categoryId: 'cat-plumb', name: 'Geyser Installation & Repair', slug: 'geyser-service', shortDescription: 'Water heater install, no-heat repair and safety valve service.', longDescription: 'Install, repair or service electric geysers with complete safety checks on wiring, thermostat and pressure valve.', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '45-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-plumb-04-b', name: 'Basic', basePrice: 449, durationMins: 90, inclusions: ['No-heat / low-heat repair', 'Thermostat & element check'], exclusions: ['Element cost'] },
    { id: 'pkg-plumb-04-s', name: 'Standard', basePrice: 799, durationMins: 150, inclusions: ['Geyser installation (1)', 'Element replacement incl. cost', 'Safety valve check'], exclusions: ['Geyser cost'] },
    { id: 'pkg-plumb-04-p', name: 'Premium', basePrice: 1299, durationMins: 240, inclusions: ['Install + full service + plumbing', 'Up to 2 geysers', 'Components up to ₹1000'], exclusions: ['Geyser cost'] },
  ] },
  { id: 'svc-plumb-05', categoryId: 'cat-plumb', name: 'Toilet, Commode & Sanitaryware', slug: 'toilet-repair', shortDescription: 'Running flushes, commode leaks, seat and sanitaryware fitting.', longDescription: 'Fix running flushes, commode leaks and install new sanitaryware with proper sealing and alignment.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-plumb-05-b', name: 'Basic', basePrice: 349, durationMins: 90, inclusions: ['Flush mechanism repair', 'Commode leak seal'], exclusions: ['Sanitaryware cost'] },
    { id: 'pkg-plumb-05-s', name: 'Standard', basePrice: 649, durationMins: 180, inclusions: ['Commode/seat installation', 'Flush + inlet repairs', 'Components up to ₹400'], exclusions: ['Sanitaryware cost'] },
    { id: 'pkg-plumb-05-p', name: 'Premium', basePrice: 1099, durationMins: 300, inclusions: ['Full bathroom sanitary install', 'Up to 2 installations', 'Components up to ₹900'], exclusions: ['Sanitaryware cost'] },
  ] },
  { id: 'svc-plumb-06', categoryId: 'cat-plumb', name: 'Bathroom Plumbing & Pipeline', slug: 'bathroom-pipeline', shortDescription: 'New pipe lines, CPVC plumbing and bathroom renovation support.', longDescription: 'Plan and execute new bathroom plumbing, CPVC piping and supply line routing with pressure testing before handover.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 349, warranty: { label: '6-month workmanship warranty', months: 6 }, packages: [
    { id: 'pkg-plumb-06-b', name: 'Basic', basePrice: 1299, durationMins: 300, inclusions: ['Inspection & piping plan', 'Up to 10m CPVC line'], exclusions: ['Pipe material cost'] },
    { id: 'pkg-plumb-06-s', name: 'Standard', basePrice: 2499, durationMins: 480, inclusions: ['Bathroom CPVC plumbing', 'Fitting installation (up to 4)', 'Pressure test'], exclusions: ['Pipe material cost'] },
    { id: 'pkg-plumb-06-p', name: 'Premium', basePrice: 4499, durationMins: 720, inclusions: ['Full bathroom + kitchen plumbing', 'All fittings + concealed lines', 'Components up to ₹2500'], exclusions: ['Fitting cost'] },
  ] },

  // AC
  { id: 'svc-ac-01', categoryId: 'cat-ac', name: 'AC Service & Cleaning', slug: 'ac-service', shortDescription: 'Split AC cleaning, gas check and cooling performance service.', longDescription: 'Deep clean filters, coils and drain lines; check gas pressure and cooling performance. Your AC works quieter and cooler.', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day service warranty', months: 1 }, packages: [
    { id: 'pkg-ac-01-b', name: 'Basic', basePrice: 499, durationMins: 60, inclusions: ['Filter + coil cleaning', 'Drain line check', 'Cooling check'], exclusions: ['Gas top-up'] },
    { id: 'pkg-ac-01-s', name: 'Standard', basePrice: 799, durationMins: 90, inclusions: ['Full indoor + outdoor cleaning', 'Gas pressure check', 'Condenser wash'], exclusions: ['Gas top-up'] },
    { id: 'pkg-ac-01-p', name: 'Premium', basePrice: 1299, durationMins: 150, inclusions: ['Deep clean both units', 'Gas top-up (up to 150g)', 'Electrical check + report'], exclusions: ['Refrigerant beyond 150g'] },
  ] },
  { id: 'svc-ac-02', categoryId: 'cat-ac', name: 'AC Repair & Gas Refill', slug: 'ac-repair', shortDescription: 'Not cooling, gas leak, error codes — diagnosed and fixed.', longDescription: 'Certified technicians diagnose AC faults, repair compressors/boards where feasible and refill refrigerant with leak testing.', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 299, warranty: { label: '90-day repair warranty', months: 3 }, packages: [
    { id: 'pkg-ac-02-b', name: 'Basic', basePrice: 699, durationMins: 120, inclusions: ['Fault diagnosis', 'Minor repair (sensor, capacitor)', 'Components up to ₹500'], exclusions: ['Gas refill'] },
    { id: 'pkg-ac-02-s', name: 'Standard', basePrice: 1199, durationMins: 180, inclusions: ['Diagnosis + repair', 'Gas refill (up to 300g)', 'Components up to ₹1200'], exclusions: ['Compressor/PCB'] },
    { id: 'pkg-ac-02-p', name: 'Premium', basePrice: 1899, durationMins: 300, inclusions: ['Full repair + gas refill + cleaning', 'Components up to ₹2500', '90-day warranty on parts'], exclusions: ['Compressor/PCB'] },
  ] },
  { id: 'svc-ac-03', categoryId: 'cat-ac', name: 'AC Installation & Uninstallation', slug: 'ac-installation', shortDescription: 'New AC install, relocation and uninstallation with safety.', longDescription: 'Professional split/window AC installation with brazing (for inverter), vacuuming, pressure test and leak check.', image: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day installation warranty', months: 1 }, packages: [
    { id: 'pkg-ac-03-b', name: 'Basic', basePrice: 899, durationMins: 120, inclusions: ['Window AC installation', 'Bracket mounting', 'Sealing & drain setup'], exclusions: ['Bracket/copper cost'] },
    { id: 'pkg-ac-03-s', name: 'Standard', basePrice: 1499, durationMins: 180, inclusions: ['Split AC installation', 'Vacuum + pressure test', 'Up to 10ft copper pipe'], exclusions: ['Additional copper'] },
    { id: 'pkg-ac-03-p', name: 'Premium', basePrice: 2299, durationMins: 300, inclusions: ['Inverter AC install + commissioning', 'Uninstallation of old unit', 'Up to 15ft copper + brazing'], exclusions: ['Copper beyond 15ft'] },
  ] },
  { id: 'svc-ac-04', categoryId: 'cat-ac', name: 'AC Annual Maintenance Contract', slug: 'ac-amc', shortDescription: '2 or 3 preventive services in a year at a fixed price.', longDescription: 'Keep your ACs in top condition with scheduled preventive maintenance visits, priority repair and member pricing on parts.', image: 'https://images.unsplash.com/photo-1615796153287-98eacf0cfa5b?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: 'Valid for 12 months', months: 12 }, packages: [
    { id: 'pkg-ac-04-b', name: 'Basic', basePrice: 1299, durationMins: 240, inclusions: ['2 services per year', 'Priority scheduling'], exclusions: ['Gas & parts'] },
    { id: 'pkg-ac-04-s', name: 'Standard', basePrice: 1999, durationMins: 360, inclusions: ['3 services per year', 'Priority scheduling', '10% off on repairs'], exclusions: ['Gas & parts'] },
    { id: 'pkg-ac-04-p', name: 'Premium', basePrice: 2999, durationMins: 480, inclusions: ['3 services + 1 emergency visit', '15% off on repairs', 'Free gas check each visit'], exclusions: ['Gas & parts'] },
  ] },

  // Appliance repair
  { id: 'svc-app-01', categoryId: 'cat-app', name: 'Washing Machine Repair', slug: 'washing-machine-repair', shortDescription: 'Drum, motor, drainage and washing faults diagnosed and fixed.', longDescription: 'Front and top load washing machine repairs — draining, spinning, noise, leaks and error codes handled on-site.', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 249, warranty: { label: '90-day repair warranty', months: 3 }, packages: [
    { id: 'pkg-app-01-b', name: 'Basic', basePrice: 599, durationMins: 120, inclusions: ['Fault diagnosis', 'Minor repair (belt, pump)', 'Components up to ₹400'], exclusions: ['Motor/PCB'] },
    { id: 'pkg-app-01-s', name: 'Standard', basePrice: 999, durationMins: 180, inclusions: ['Diagnosis + repair', 'Components up to ₹1200', 'Drainage + spin test'], exclusions: ['Motor/PCB'] },
    { id: 'pkg-app-01-p', name: 'Premium', basePrice: 1699, durationMins: 300, inclusions: ['Full repair + drum service', 'Components up to ₹2500', '90-day warranty on parts'], exclusions: ['Motor/PCB'] },
  ] },
  { id: 'svc-app-02', categoryId: 'cat-app', name: 'Refrigerator Repair', slug: 'refrigerator-repair', shortDescription: 'Not cooling, leaking, noise or ice build-up — fixed at home.', longDescription: 'Single and double door fridge repairs covering cooling faults, gas leaks, door seals, thermostats and compressors.', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 299, warranty: { label: '90-day repair warranty', months: 3 }, packages: [
    { id: 'pkg-app-02-b', name: 'Basic', basePrice: 699, durationMins: 120, inclusions: ['Cooling diagnosis', 'Door seal/thermostat repair', 'Components up to ₹500'], exclusions: ['Gas/compressor'] },
    { id: 'pkg-app-02-s', name: 'Standard', basePrice: 1199, durationMins: 180, inclusions: ['Diagnosis + repair', 'Components up to ₹1500', 'Gas check'], exclusions: ['Compressor'] },
    { id: 'pkg-app-02-p', name: 'Premium', basePrice: 1999, durationMins: 300, inclusions: ['Full repair + gas top-up', 'Components up to ₹3000', '90-day warranty on parts'], exclusions: ['Compressor'] },
  ] },
  { id: 'svc-app-03', categoryId: 'cat-app', name: 'Microwave Oven Repair', slug: 'microwave-repair', shortDescription: 'Not heating, sparking, turntable or display faults.', longDescription: 'Solo and convection microwave repair covering heating issues, sparking, magnetron, control boards and turntables.', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 249, warranty: { label: '90-day repair warranty', months: 3 }, packages: [
    { id: 'pkg-app-03-b', name: 'Basic', basePrice: 499, durationMins: 90, inclusions: ['Heating diagnosis', 'Fuse/door switch repair', 'Components up to ₹300'], exclusions: ['Magnetron'] },
    { id: 'pkg-app-03-s', name: 'Standard', basePrice: 899, durationMins: 150, inclusions: ['Diagnosis + repair', 'Components up to ₹1000', 'Magnetron test'], exclusions: ['Magnetron'] },
    { id: 'pkg-app-03-p', name: 'Premium', basePrice: 1499, durationMins: 240, inclusions: ['Full repair incl. magnetron/board', 'Components up to ₹2000', '90-day warranty on parts'], exclusions: [] },
  ] },
  { id: 'svc-app-04', categoryId: 'cat-app', name: 'TV Repair & Service', slug: 'tv-repair', shortDescription: 'No power, no display, lines or sound faults — on-site repair.', longDescription: 'LED/LCD TV repairs including power supply, backlight, panel diagnostics and sound issues, done at your home.', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 299, warranty: { label: '90-day repair warranty', months: 3 }, packages: [
    { id: 'pkg-app-04-b', name: 'Basic', basePrice: 549, durationMins: 90, inclusions: ['Power/display diagnosis', 'Minor repair (capacitors, fuses)'], exclusions: ['Panel/board'] },
    { id: 'pkg-app-04-s', name: 'Standard', basePrice: 949, durationMins: 150, inclusions: ['Diagnosis + repair', 'Components up to ₹1200', 'Backlight/power test'], exclusions: ['Panel'] },
    { id: 'pkg-app-04-p', name: 'Premium', basePrice: 1599, durationMins: 240, inclusions: ['Full repair incl. board repair', 'Components up to ₹2500', '90-day warranty on parts'], exclusions: ['Panel'] },
  ] },
  { id: 'svc-app-05', categoryId: 'cat-app', name: 'Kitchen Chimney Service', slug: 'chimney-service', shortDescription: 'Chimney cleaning, motor repair and installation.', longDescription: 'Degrease, clean filters and ducts, and fix motor/light issues for kitchen chimneys. Installations done with proper ducting.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day service warranty', months: 1 }, packages: [
    { id: 'pkg-app-05-b', name: 'Basic', basePrice: 449, durationMins: 90, inclusions: ['Filter + duct cleaning', 'Motor check'], exclusions: ['Motor cost'] },
    { id: 'pkg-app-05-s', name: 'Standard', basePrice: 799, durationMins: 150, inclusions: ['Deep clean + motor repair', 'Components up to ₹600', 'Light/bulb replacement'], exclusions: ['Motor cost'] },
    { id: 'pkg-app-05-p', name: 'Premium', basePrice: 1399, durationMins: 240, inclusions: ['Chimney installation + service', 'Ducting support', 'Components up to ₹1200'], exclusions: ['Chimney cost'] },
  ] },

  // Cleaning & pest control
  { id: 'svc-clean-01', categoryId: 'cat-clean', name: 'Full Home Deep Cleaning', slug: 'deep-cleaning', shortDescription: 'Complete home deep clean — kitchen, bathrooms, floors and more.', longDescription: 'Trained cleaners deep clean every room: kitchen degreasing, bathroom descaling, floor scrubbing, cobweb removal and dusting.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: null, packages: [
    { id: 'pkg-clean-01-b', name: 'Basic', basePrice: 1499, durationMins: 240, inclusions: ['1 BHK deep clean', 'Kitchen + 1 bathroom', 'Floor + surface cleaning'], exclusions: ['Balcony/terrace'] },
    { id: 'pkg-clean-01-s', name: 'Standard', basePrice: 2499, durationMins: 360, inclusions: ['2 BHK deep clean', 'Full kitchen + bathrooms', 'Windows & fans dusting'], exclusions: ['External cleaning'] },
    { id: 'pkg-clean-01-p', name: 'Premium', basePrice: 3999, durationMins: 540, inclusions: ['3+ BHK complete clean', 'Furniture shampoo support', 'Balcony + storage areas', 'Sanitisation misting'], exclusions: ['External cleaning'] },
  ] },
  { id: 'svc-clean-02', categoryId: 'cat-clean', name: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', shortDescription: 'Machine shampoo cleaning for sofas, carpets and mattresses.', longDescription: 'Steam + shampoo machine cleaning removes stains, dust mites and odours from sofas, carpets, mattresses and curtains.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: null, packages: [
    { id: 'pkg-clean-02-b', name: 'Basic', basePrice: 899, durationMins: 120, inclusions: ['1-seater sofa or single mattress'], exclusions: ['Stain-removal chemicals'] },
    { id: 'pkg-clean-02-s', name: 'Standard', basePrice: 1699, durationMins: 210, inclusions: ['3-seater sofa + 1 mattress', 'Steam + shampoo wash'], exclusions: ['Carpet'] },
    { id: 'pkg-clean-02-p', name: 'Premium', basePrice: 2999, durationMins: 360, inclusions: ['Full sofa set + carpet + mattress', 'Anti-dust-mite treatment'], exclusions: [] },
  ] },
  { id: 'svc-clean-03', categoryId: 'cat-clean', name: 'Bathroom & Kitchen Cleaning', slug: 'bathroom-kitchen-cleaning', shortDescription: 'Deep descale, degrease and sanitise your wet areas.', longDescription: 'Targeted deep clean for bathrooms (tiles, taps, commode, glass) and kitchens (chimney, hob, sink, cabinets).', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: null, packages: [
    { id: 'pkg-clean-03-b', name: 'Basic', basePrice: 799, durationMins: 180, inclusions: ['1 bathroom OR kitchen deep clean'], exclusions: ['Chimney degrease'] },
    { id: 'pkg-clean-03-s', name: 'Standard', basePrice: 1399, durationMins: 300, inclusions: ['2 bathrooms OR kitchen + 1 bath', 'Tile & grout scrubbing'], exclusions: [] },
    { id: 'pkg-clean-03-p', name: 'Premium', basePrice: 2199, durationMins: 420, inclusions: ['Full kitchen + all bathrooms', 'Chimney + hob degrease', 'Sanitisation'], exclusions: [] },
  ] },
  { id: 'svc-clean-04', categoryId: 'cat-clean', name: 'Pest Control Treatment', slug: 'pest-control', shortDescription: 'Cockroach, ant, mosquito, rodent and bedbug treatment.', longDescription: 'EPA-approved gel, spray and baiting treatments for cockroaches, ants, mosquitoes, bedbugs and rodents with safety guidance.', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 199, warranty: { label: '90-day pest-free warranty', months: 3 }, packages: [
    { id: 'pkg-clean-04-b', name: 'Basic', basePrice: 999, durationMins: 120, inclusions: ['1 BHK cockroach/ant treatment', 'Gel + spray application'], exclusions: ['Rodent traps'] },
    { id: 'pkg-clean-04-s', name: 'Standard', basePrice: 1699, durationMins: 180, inclusions: ['2 BHK multi-pest treatment', 'Cockroach + ant + mosquito'], exclusions: ['Rodents'] },
    { id: 'pkg-clean-04-p', name: 'Premium', basePrice: 2799, durationMins: 300, inclusions: ['3+ BHK full treatment', 'All pests incl. bedbug/rodent', 'Follow-up visit included'], exclusions: [] },
  ] },
  { id: 'svc-clean-05', categoryId: 'cat-clean', name: 'Move-in / Move-out Cleaning', slug: 'move-in-cleaning', shortDescription: 'Pre-possession deep clean for new or vacated homes.', longDescription: 'Complete cleaning for freshly rented or vacated homes — every nook, cabinet and fixture made ready for the next resident.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: null, packages: [
    { id: 'pkg-clean-05-b', name: 'Basic', basePrice: 1999, durationMins: 360, inclusions: ['1 BHK move-in clean', 'Kitchen, bathroom, floors'], exclusions: [] },
    { id: 'pkg-clean-05-s', name: 'Standard', basePrice: 2999, durationMins: 540, inclusions: ['2 BHK move-in clean', 'Cabinets + fixtures + windows'], exclusions: [] },
    { id: 'pkg-clean-05-p', name: 'Premium', basePrice: 4499, durationMins: 720, inclusions: ['3+ BHK full move-in clean', 'Fridge/oven interior', 'Balcony + store', 'Sanitisation'], exclusions: [] },
  ] },

  // Painter
  { id: 'svc-paint-01', categoryId: 'cat-paint', name: 'Wall Painting (Single Room)', slug: 'single-room-painting', shortDescription: 'Painting one room with putty, primer and emulsion finish.', longDescription: 'Room-wise painting with wall preparation, putty application, primer and premium emulsion finish by trained painters.', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 299, warranty: { label: '6-month paint warranty', months: 6 }, packages: [
    { id: 'pkg-paint-01-b', name: 'Basic', basePrice: 3499, durationMins: 720, inclusions: ['Room walls + ceiling paint', 'Putty + primer + emulsion'], exclusions: ['Paint material cost'] },
    { id: 'pkg-paint-01-s', name: 'Standard', basePrice: 5499, durationMins: 1080, inclusions: ['Room with premium emulsion', 'Crack-filling + putty', 'Skirting + frame touch-up'], exclusions: ['Paint material cost'] },
    { id: 'pkg-paint-01-p', name: 'Premium', basePrice: 8499, durationMins: 1440, inclusions: ['Room with designer finish', 'Full wall prep + 2 coats', 'Debris cleanup'], exclusions: ['Paint material cost'] },
  ] },
  { id: 'svc-paint-02', categoryId: 'cat-paint', name: 'Full Home Painting', slug: 'home-painting', shortDescription: 'Complete home interior painting with material support.', longDescription: 'End-to-end home painting: estimation, colour consultation, surface prep, primer, two coats and cleanup.', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 499, warranty: { label: '6-month paint warranty', months: 6 }, packages: [
    { id: 'pkg-paint-02-b', name: 'Basic', basePrice: 9999, durationMins: 2160, inclusions: ['1 BHK complete paint', 'Walls + ceilings'], exclusions: ['Paint material cost'] },
    { id: 'pkg-paint-02-s', name: 'Standard', basePrice: 15999, durationMins: 2880, inclusions: ['2 BHK complete paint', 'Full surface prep', 'Woodwork touch-up'], exclusions: ['Paint material cost'] },
    { id: 'pkg-paint-02-p', name: 'Premium', basePrice: 24999, durationMins: 4320, inclusions: ['3+ BHK complete paint', 'Designer finishes', 'Furniture protection + cleanup'], exclusions: ['Paint material cost'] },
  ] },

  // Carpenter
  { id: 'svc-carp-01', categoryId: 'cat-carp', name: 'Furniture Assembly', slug: 'furniture-assembly', shortDescription: 'Flat-pack furniture, wardrobes and modular assembly.', longDescription: 'Professional assembly of flat-pack furniture, modular wardrobes, study tables and TV units with proper anchoring.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-carp-01-b', name: 'Basic', basePrice: 599, durationMins: 120, inclusions: ['Single furniture assembly'], exclusions: ['Wall mounting'] },
    { id: 'pkg-carp-01-s', name: 'Standard', basePrice: 999, durationMins: 210, inclusions: ['2-3 pieces assembly', 'Wall anchoring included'], exclusions: [] },
    { id: 'pkg-carp-01-p', name: 'Premium', basePrice: 1799, durationMins: 360, inclusions: ['Full room assembly', 'Modular wardrobe + desk + TV unit'], exclusions: [] },
  ] },
  { id: 'svc-carp-02', categoryId: 'cat-carp', name: 'Door, Lock & Hinge Repair', slug: 'door-lock-repair', shortDescription: 'Sticking doors, broken locks, hinges and handles fixed.', longDescription: 'Fix misaligned doors, replace locks/handles, tighten hinges and adjust door closers for smooth operation.', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: false, inspectionFee: 0, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-carp-02-b', name: 'Basic', basePrice: 349, durationMins: 60, inclusions: ['Single door repair', 'Hinge/lock adjustment'], exclusions: ['Lock cost'] },
    { id: 'pkg-carp-02-s', name: 'Standard', basePrice: 599, durationMins: 120, inclusions: ['Up to 3 doors', 'Lock + handle replacement', 'Components up to ₹400'], exclusions: ['Lock cost'] },
    { id: 'pkg-carp-02-p', name: 'Premium', basePrice: 999, durationMins: 240, inclusions: ['Whole-home door check', 'All repairs + replacements', 'Components up to ₹900'], exclusions: ['Lock cost'] },
  ] },
  { id: 'svc-carp-03', categoryId: 'cat-carp', name: 'Furniture & Wood Repair', slug: 'furniture-repair', shortDescription: 'Broken joints, loose laminates and wood restoration.', longDescription: 'Repair broken furniture joints, loose laminates, drawers and shelves. Bring old furniture back to life.', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 199, warranty: { label: '30-day workmanship warranty', months: 1 }, packages: [
    { id: 'pkg-carp-03-b', name: 'Basic', basePrice: 449, durationMins: 90, inclusions: ['Single joint/laminate repair'], exclusions: ['Material cost'] },
    { id: 'pkg-carp-03-s', name: 'Standard', basePrice: 799, durationMins: 180, inclusions: ['Up to 3 repairs', 'Components up to ₹500'], exclusions: [] },
    { id: 'pkg-carp-03-p', name: 'Premium', basePrice: 1399, durationMins: 360, inclusions: ['Full furniture restoration', 'Components up to ₹1500'], exclusions: [] },
  ] },

  // Waterproofing & home care
  { id: 'svc-water-01', categoryId: 'cat-water', name: 'Bathroom Waterproofing', slug: 'bathroom-waterproofing', shortDescription: 'Stop seepage with professional waterproofing.', longDescription: 'Anti-seepage treatment for bathrooms, balconies and terraces with polymer-modified waterproofing coats.', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 399, warranty: { label: '12-month leak-free warranty', months: 12 }, packages: [
    { id: 'pkg-water-01-b', name: 'Basic', basePrice: 1999, durationMins: 480, inclusions: ['Single bathroom waterproofing'], exclusions: ['Tile work'] },
    { id: 'pkg-water-01-s', name: 'Standard', basePrice: 3499, durationMins: 720, inclusions: ['2 bathrooms + balcony', 'Crack-filling + coating'], exclusions: ['Tile work'] },
    { id: 'pkg-water-01-p', name: 'Premium', basePrice: 5999, durationMins: 1080, inclusions: ['Full wet-area waterproofing', 'Grouting + coating', '12-month warranty'], exclusions: ['Tile work'] },
  ] },
  { id: 'svc-water-02', categoryId: 'cat-water', name: 'Tile & Grout Repair', slug: 'tile-grout-repair', shortDescription: 'Loose tiles, grout lines and anti-skid treatment.', longDescription: 'Fix hollow/loose tiles, redo grout lines and apply anti-skid coating for bathrooms and kitchens.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=400&q=80', isEmergency: false, needsInspection: true, inspectionFee: 299, warranty: { label: '60-day workmanship warranty', months: 2 }, packages: [
    { id: 'pkg-water-02-b', name: 'Basic', basePrice: 899, durationMins: 240, inclusions: ['Up to 5 loose tiles fixed'], exclusions: ['Tile cost'] },
    { id: 'pkg-water-02-s', name: 'Standard', basePrice: 1499, durationMins: 420, inclusions: ['Tile fix + grout redo (1 area)'], exclusions: ['Tile cost'] },
    { id: 'pkg-water-02-p', name: 'Premium', basePrice: 2499, durationMins: 600, inclusions: ['Full bathroom tile + grout', 'Anti-skid treatment'], exclusions: ['Tile cost'] },
  ] },
]

// ---------------------------------------------------------------------------
// Professionals (doc #60-#78, #139)
// ---------------------------------------------------------------------------

export type ProfessionalStatus = 'PendingVerification' | 'Active' | 'Suspended'

export type Professional = {
  id: string
  name: string
  phone: string
  email: string
  cityId: string
  image: string
  skills: readonly string[] // serviceIds
  areas: readonly string[] // localityIds
  status: ProfessionalStatus
  rating: number
  reviewCount: number
  completedJobs: number
  experienceYears: number
  level: 'Standard' | 'Silver' | 'Gold' | 'Elite'
  verified: boolean
  joinedAt: string
  bio: string
}

export const PROFESSIONALS: readonly Professional[] = [
  { id: 'pro-001', name: 'Ramesh Kumar', phone: '98100 11223', email: 'ramesh.k@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-01', 'svc-elec-03', 'svc-elec-06'], areas: ['del-03', 'del-04', 'del-09'], status: 'Active', rating: 4.8, reviewCount: 156, completedJobs: 340, experienceYears: 12, level: 'Gold', verified: true, joinedAt: '2024-01-15', bio: 'Licensed electrician specialising in home wiring, fans and inverter systems.' },
  { id: 'pro-002', name: 'Suresh Yadav', phone: '98200 33445', email: 'suresh.y@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-02', 'svc-elec-04', 'svc-elec-05'], areas: ['del-01', 'del-02', 'del-05'], status: 'Active', rating: 4.6, reviewCount: 98, completedJobs: 210, experienceYears: 9, level: 'Silver', verified: true, joinedAt: '2024-03-02', bio: 'Emergency electrical response specialist with MCB and DB expertise.' },
  { id: 'pro-003', name: 'Anil Verma', phone: '98300 55667', email: 'anil.v@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-01', 'svc-elec-02', 'svc-elec-04'], areas: ['del-06', 'del-08', 'del-10'], status: 'Active', rating: 4.9, reviewCount: 201, completedJobs: 420, experienceYears: 15, level: 'Elite', verified: true, joinedAt: '2023-11-20', bio: 'Senior electrician, 15 years experience, whole-home audits and rewiring.' },
  { id: 'pro-004', name: 'Mohd. Faizan', phone: '98400 77889', email: 'faizan.m@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-plumb-01', 'svc-plumb-02', 'svc-plumb-04'], areas: ['del-03', 'del-07', 'del-09'], status: 'Active', rating: 4.7, reviewCount: 134, completedJobs: 280, experienceYears: 10, level: 'Gold', verified: true, joinedAt: '2024-02-10', bio: 'Plumber covering fittings, drainage and geyser installation.' },
  { id: 'pro-005', name: 'Ravi Shankar', phone: '98500 99001', email: 'ravi.s@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-plumb-02', 'svc-plumb-03', 'svc-plumb-06'], areas: ['del-01', 'del-05', 'del-08'], status: 'Active', rating: 4.5, reviewCount: 87, completedJobs: 190, experienceYears: 8, level: 'Silver', verified: true, joinedAt: '2024-04-18', bio: 'Pipeline and leakage specialist with concealed line detection experience.' },
  { id: 'pro-006', name: 'Vijay Singh', phone: '98600 22334', email: 'vijay.s@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-plumb-01', 'svc-plumb-04', 'svc-plumb-05'], areas: ['del-02', 'del-04', 'del-10'], status: 'Active', rating: 4.4, reviewCount: 64, completedJobs: 150, experienceYears: 7, level: 'Standard', verified: true, joinedAt: '2024-06-05', bio: 'Sanitaryware and bathroom fitting specialist.' },
  { id: 'pro-007', name: 'Arun Nair', phone: '98700 44556', email: 'arun.n@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-ac-01', 'svc-ac-02', 'svc-ac-04'], areas: ['ggn-01', 'ggn-02', 'ggn-05'], status: 'Active', rating: 4.9, reviewCount: 178, completedJobs: 380, experienceYears: 11, level: 'Elite', verified: true, joinedAt: '2023-12-01', bio: 'AC certified technician — cleaning, gas refill, repair and AMC.' },
  { id: 'pro-008', name: 'Deepak Bhatia', phone: '98800 66778', email: 'deepak.b@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-ac-02', 'svc-ac-03'], areas: ['ggn-03', 'ggn-06', 'ggn-07'], status: 'Active', rating: 4.7, reviewCount: 112, completedJobs: 240, experienceYears: 9, level: 'Gold', verified: true, joinedAt: '2024-02-22', bio: 'AC installation and repair specialist for all major brands.' },
  { id: 'pro-009', name: 'Sanjay Mehta', phone: '98900 88990', email: 'sanjay.m@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-01', 'svc-elec-04', 'svc-ac-01'], areas: ['ggn-01', 'ggn-04', 'ggn-08'], status: 'Active', rating: 4.6, reviewCount: 90, completedJobs: 200, experienceYears: 10, level: 'Gold', verified: true, joinedAt: '2024-01-28', bio: 'Multi-skilled electrician and AC service technician.' },
  { id: 'pro-010', name: 'Karan Kapoor', phone: '99000 11221', email: 'karan.k@example.com', cityId: 'noida', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-app-01', 'svc-app-02', 'svc-app-05'], areas: ['noida-01', 'noida-02', 'noida-04'], status: 'Active', rating: 4.8, reviewCount: 145, completedJobs: 310, experienceYears: 12, level: 'Gold', verified: true, joinedAt: '2024-03-14', bio: 'Appliance repair specialist — washing machines, fridges and chimneys.' },
  { id: 'pro-011', name: 'Rohit Malhotra', phone: '99100 33443', email: 'rohit.m@example.com', cityId: 'noida', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-app-03', 'svc-app-04'], areas: ['noida-03', 'noida-05', 'noida-06'], status: 'Active', rating: 4.5, reviewCount: 76, completedJobs: 165, experienceYears: 8, level: 'Silver', verified: true, joinedAt: '2024-05-09', bio: 'Microwave and TV repair technician.' },
  { id: 'pro-012', name: 'Pooja Sharma', phone: '99200 55665', email: 'pooja.s@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-01', 'svc-clean-03', 'svc-clean-05'], areas: ['del-03', 'del-04', 'del-07'], status: 'Active', rating: 4.9, reviewCount: 220, completedJobs: 460, experienceYears: 8, level: 'Elite', verified: true, joinedAt: '2023-10-12', bio: 'Professional deep cleaning lead for homes and move-in/move-out.' },
  { id: 'pro-013', name: 'Neha Gupta', phone: '99300 77887', email: 'neha.g@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-02', 'svc-clean-03'], areas: ['del-01', 'del-02', 'del-06'], status: 'Active', rating: 4.7, reviewCount: 130, completedJobs: 275, experienceYears: 6, level: 'Gold', verified: true, joinedAt: '2024-04-01', bio: 'Sofa, carpet and upholstery cleaning expert.' },
  { id: 'pro-014', name: 'Amit Chaudhary', phone: '99400 99009', email: 'amit.c@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-04'], areas: ['del-05', 'del-08', 'del-10'], status: 'Active', rating: 4.6, reviewCount: 88, completedJobs: 190, experienceYears: 7, level: 'Silver', verified: true, joinedAt: '2024-02-14', bio: 'Certified pest control operator — gel, spray and baiting.' },
  { id: 'pro-015', name: 'Manoj Tiwari', phone: '99500 11220', email: 'manoj.t@example.com', cityId: 'noida', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-paint-01', 'svc-paint-02'], areas: ['noida-02', 'noida-04', 'noida-07'], status: 'Active', rating: 4.7, reviewCount: 102, completedJobs: 220, experienceYears: 13, level: 'Gold', verified: true, joinedAt: '2024-01-05', bio: 'Master painter with 13 years of interior finishing experience.' },
  { id: 'pro-016', name: 'Suresh Pal', phone: '99600 33442', email: 'suresh.p@example.com', cityId: 'ghz', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-carp-01', 'svc-carp-02', 'svc-carp-03'], areas: ['ghz-01', 'ghz-02', 'ghz-06'], status: 'Active', rating: 4.8, reviewCount: 119, completedJobs: 250, experienceYears: 11, level: 'Gold', verified: true, joinedAt: '2024-03-20', bio: 'Carpenter for furniture assembly, doors and wood repair.' },
  { id: 'pro-017', name: 'Rajesh Kumar', phone: '99700 55664', email: 'rajesh.k@example.com', cityId: 'fbd', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-plumb-01', 'svc-plumb-02', 'svc-plumb-03'], areas: ['fbd-01', 'fbd-02', 'fbd-05'], status: 'Active', rating: 4.5, reviewCount: 71, completedJobs: 160, experienceYears: 9, level: 'Silver', verified: true, joinedAt: '2024-05-30', bio: 'Plumber covering all residential plumbing needs.' },
  { id: 'pro-018', name: 'Vikram Dutt', phone: '99800 77886', email: 'vikram.d@example.com', cityId: 'ghz', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-01', 'svc-elec-02', 'svc-elec-05'], areas: ['ghz-03', 'ghz-04', 'ghz-05'], status: 'Active', rating: 4.6, reviewCount: 93, completedJobs: 205, experienceYears: 10, level: 'Gold', verified: true, joinedAt: '2024-02-08', bio: 'Electrician for wiring, MCB and whole-home electrical work.' },
  { id: 'pro-019', name: 'Sandeep Rao', phone: '99900 99008', email: 'sandeep.r@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-ac-01', 'svc-ac-02', 'svc-ac-03'], areas: ['ggn-02', 'ggn-05', 'ggn-07'], status: 'Active', rating: 4.8, reviewCount: 141, completedJobs: 300, experienceYears: 10, level: 'Gold', verified: true, joinedAt: '2024-01-18', bio: 'AC expert — service, repair and installation for split & window units.' },
  { id: 'pro-020', name: 'Farhan Ali', phone: '98111 22334', email: 'farhan.a@example.com', cityId: 'noida', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-01', 'svc-clean-04'], areas: ['noida-01', 'noida-03', 'noida-06'], status: 'Active', rating: 4.7, reviewCount: 108, completedJobs: 230, experienceYears: 7, level: 'Gold', verified: true, joinedAt: '2024-04-12', bio: 'Deep cleaning and pest control specialist.' },
  { id: 'pro-021', name: 'Gaurav Bansal', phone: '98222 44556', email: 'gaurav.b@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-app-01', 'svc-app-02', 'svc-app-05'], areas: ['del-01', 'del-06', 'del-08'], status: 'Active', rating: 4.6, reviewCount: 84, completedJobs: 180, experienceYears: 8, level: 'Silver', verified: true, joinedAt: '2024-05-22', bio: 'Appliance repair technician for home appliances.' },
  { id: 'pro-022', name: 'Sunil Narang', phone: '98333 66778', email: 'sunil.n@example.com', cityId: 'fbd', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-water-01', 'svc-water-02'], areas: ['fbd-03', 'fbd-04', 'fbd-06'], status: 'Active', rating: 4.4, reviewCount: 58, completedJobs: 130, experienceYears: 12, level: 'Silver', verified: true, joinedAt: '2024-03-11', bio: 'Waterproofing and tile expert.' },
  { id: 'pro-023', name: 'Imran Khan', phone: '98444 88990', email: 'imran.k@example.com', cityId: 'ghz', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-plumb-04', 'svc-plumb-05', 'svc-plumb-06'], areas: ['ghz-01', 'ghz-03', 'ghz-05'], status: 'Active', rating: 4.5, reviewCount: 79, completedJobs: 170, experienceYears: 9, level: 'Silver', verified: true, joinedAt: '2024-04-25', bio: 'Geyser, sanitaryware and bathroom plumbing specialist.' },
  { id: 'pro-024', name: 'Priya Nair', phone: '98555 11221', email: 'priya.n@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-02', 'svc-clean-05'], areas: ['del-02', 'del-05', 'del-10'], status: 'Active', rating: 4.8, reviewCount: 132, completedJobs: 280, experienceYears: 6, level: 'Gold', verified: true, joinedAt: '2024-02-02', bio: 'Move-in/move-out and upholstery cleaning expert.' },
  { id: 'pro-025', name: 'Ashok Meena', phone: '98666 33443', email: 'ashok.m@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-carp-01', 'svc-carp-02'], areas: ['ggn-01', 'ggn-03', 'ggn-06'], status: 'Active', rating: 4.6, reviewCount: 96, completedJobs: 210, experienceYears: 10, level: 'Gold', verified: true, joinedAt: '2024-01-30', bio: 'Furniture assembly and door repair carpenter.' },
  { id: 'pro-026', name: 'Meena Devi', phone: '98777 55665', email: 'meena.d@example.com', cityId: 'noida', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-01', 'svc-clean-03'], areas: ['noida-02', 'noida-05', 'noida-07'], status: 'Active', rating: 4.9, reviewCount: 165, completedJobs: 350, experienceYears: 7, level: 'Elite', verified: true, joinedAt: '2023-11-08', bio: 'Senior deep-cleaning professional.' },
  { id: 'pro-027', name: 'Harish Chandra', phone: '98888 77887', email: 'harish.c@example.com', cityId: 'fbd', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-elec-01', 'svc-elec-03', 'svc-elec-06'], areas: ['fbd-01', 'fbd-02', 'fbd-04'], status: 'Active', rating: 4.5, reviewCount: 67, completedJobs: 145, experienceYears: 8, level: 'Silver', verified: true, joinedAt: '2024-05-14', bio: 'Electrician for fittings, fans and inverter systems.' },
  { id: 'pro-028', name: 'Ritu Agarwal', phone: '98999 99007', email: 'ritu.a@example.com', cityId: 'del', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-clean-01', 'svc-clean-02', 'svc-clean-05'], areas: ['del-03', 'del-06', 'del-09'], status: 'PendingVerification', rating: 0, reviewCount: 0, completedJobs: 0, experienceYears: 4, level: 'Standard', verified: false, joinedAt: '2026-08-10', bio: 'New professional — house cleaning and sofa shampoo.' },
  { id: 'pro-029', name: 'Nitin Grover', phone: '99111 22332', email: 'nitin.g@example.com', cityId: 'ghz', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-app-01', 'svc-app-03'], areas: ['ghz-02', 'ghz-04', 'ghz-06'], status: 'PendingVerification', rating: 0, reviewCount: 0, completedJobs: 0, experienceYears: 5, level: 'Standard', verified: false, joinedAt: '2026-08-12', bio: 'New professional — washing machine and microwave repair.' },
  { id: 'pro-030', name: 'Rakesh Joshi', phone: '99222 44554', email: 'rakesh.j@example.com', cityId: 'ggn', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', skills: ['svc-paint-01', 'svc-paint-02'], areas: ['ggn-04', 'ggn-07', 'ggn-08'], status: 'PendingVerification', rating: 0, reviewCount: 0, completedJobs: 0, experienceYears: 11, level: 'Standard', verified: false, joinedAt: '2026-08-14', bio: 'New professional — interior painting.' },
]

// ---------------------------------------------------------------------------
// Offers / coupons (doc #136)
// ---------------------------------------------------------------------------

export type Coupon = {
  id: string
  code: string
  title: string
  type: 'percent' | 'flat'
  value: number
  minOrder: number
  maxDiscount: number
  validUntil: string
  categoryId: string | null
  active: boolean
}

export const COUPONS: readonly Coupon[] = [
  { id: 'cpn-01', code: 'FIRST20', title: '20% Off Your First Service', type: 'percent', value: 20, minOrder: 499, maxDiscount: 500, validUntil: '2026-12-31', categoryId: null, active: true },
  { id: 'cpn-02', code: 'AC200', title: '₹200 Off AC Service', type: 'flat', value: 200, minOrder: 699, maxDiscount: 200, validUntil: '2026-10-31', categoryId: 'cat-ac', active: true },
  { id: 'cpn-03', code: 'CLEAN250', title: '₹250 Off Deep Cleaning', type: 'flat', value: 250, minOrder: 1499, maxDiscount: 250, validUntil: '2026-11-30', categoryId: 'cat-clean', active: true },
  { id: 'cpn-04', code: 'WEEKEND', title: 'Weekend Electrical Offer', type: 'percent', value: 10, minOrder: 599, maxDiscount: 200, validUntil: '2026-12-31', categoryId: 'cat-elec', active: true },
  { id: 'cpn-05', code: 'INSPECTFREE', title: 'Free Inspection with Repair', type: 'flat', value: 299, minOrder: 999, maxDiscount: 299, validUntil: '2026-09-30', categoryId: null, active: true },
]

// ---------------------------------------------------------------------------
// Membership plans (doc #110, #156)
// ---------------------------------------------------------------------------

export type MembershipPlan = {
  id: string
  name: string
  price: number
  validityMonths: number
  benefits: readonly string[]
  serviceDiscountPct: number
  platformFeeWaiver: boolean
  prioritySupport: boolean
}

export const MEMBERSHIP_PLANS: readonly MembershipPlan[] = [
  { id: 'mem-01', name: 'VSR Care Silver', price: 499, validityMonths: 12, benefits: ['5% off all services', 'Priority scheduling', 'Free inspection on repairs'], serviceDiscountPct: 5, platformFeeWaiver: false, prioritySupport: true },
  { id: 'mem-02', name: 'VSR Care Gold', price: 999, validityMonths: 12, benefits: ['10% off all services', 'Platform fee waived', 'Priority support', 'Free inspection on repairs'], serviceDiscountPct: 10, platformFeeWaiver: true, prioritySupport: true },
  { id: 'mem-03', name: 'VSR Care Platinum', price: 1999, validityMonths: 12, benefits: ['15% off all services', 'Platform fee waived', '24x7 priority support', 'Free annual AC service', 'Extended warranty on repairs'], serviceDiscountPct: 15, platformFeeWaiver: true, prioritySupport: true },
]

// ---------------------------------------------------------------------------
// Bookings / reviews / support (doc #117-#119, #132-#133, #141-#143)
// ---------------------------------------------------------------------------

export type BookingStatus =
  | 'New'
  | 'SearchingProvider'
  | 'AwaitingProvider'
  | 'Upcoming'
  | 'OnTheWay'
  | 'Arrived'
  | 'InService'
  | 'WaitingCustomerApproval'
  | 'PaymentPending'
  | 'Problem'
  | 'Completed'
  | 'Cancelled'

export type BookingStatusHistoryEntry = {
  from: BookingStatus | null
  to: BookingStatus
  changedAt: string
  changedBy: string
  reason?: string
}

export type Booking = {
  id: string
  number: string
  customerId: string
  customerName: string
  serviceId: string
  packageId: string
  addOnIds: readonly string[]
  cityId: string
  localityId: string
  addressLine: string
  scheduledStart: string
  expectedEnd: string
  status: BookingStatus
  assignedProfessionalId: string | null
  originalQuote: number
  currentQuote: number
  paymentStatus: 'Pending' | 'Paid' | 'Refunded' | 'Failed'
  paymentMethod: string
  customerNotes: string
  createdAt: string
  updatedAt: string
  history: readonly BookingStatusHistoryEntry[]
  emergency: boolean
  checklist: readonly string[]
  beforePhotos: readonly string[]
  afterPhotos: readonly string[]
  serviceReport: string | null
  additionalQuote: number | null
  additionalQuoteStatus: 'None' | 'Requested' | 'Approved' | 'Declined'
  reviewId: string | null
  disputeId: string | null
}

export const BOOKING_SEED: readonly Booking[] = [
  {
    id: 'bk-001', number: 'VSR-1001', customerId: 'cust-001', customerName: 'Aarav Sharma', serviceId: 'svc-ac-01', packageId: 'pkg-ac-01-s', addOnIds: ['add-01'],
    cityId: 'del', localityId: 'del-03', addressLine: 'B-14, Second Floor, Lajpat Nagar II', scheduledStart: '2026-08-18T10:00:00', expectedEnd: '2026-08-18T11:30:00',
    status: 'Completed', assignedProfessionalId: 'pro-001', originalQuote: 1298, currentQuote: 1298, paymentStatus: 'Paid', paymentMethod: 'UPI',
    customerNotes: 'Please clean both indoor and outdoor units.', createdAt: '2026-08-15T09:12:00', updatedAt: '2026-08-18T11:40:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-15T09:12:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-15T09:12:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-15T09:15:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-15T09:18:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-18T09:45:00', changedBy: 'Professional' },
      { from: 'OnTheWay', to: 'Arrived', changedAt: '2026-08-18T09:58:00', changedBy: 'Professional' },
      { from: 'Arrived', to: 'InService', changedAt: '2026-08-18T10:05:00', changedBy: 'Professional' },
      { from: 'InService', to: 'WaitingCustomerApproval', changedAt: '2026-08-18T10:50:00', changedBy: 'Professional', reason: 'Additional unit cleaning' },
      { from: 'WaitingCustomerApproval', to: 'InService', changedAt: '2026-08-18T10:55:00', changedBy: 'Customer', reason: 'Additional work approved' },
      { from: 'InService', to: 'PaymentPending', changedAt: '2026-08-18T11:25:00', changedBy: 'Professional' },
      { from: 'PaymentPending', to: 'Completed', changedAt: '2026-08-18T11:35:00', changedBy: 'System' },
    ],
    emergency: false, checklist: ['Indoor unit cleaned', 'Outdoor unit cleaned', 'Drain line checked', 'Gas pressure checked', 'Cooling verified'], beforePhotos: ['before-ac-1.jpg'], afterPhotos: ['after-ac-1.jpg'],
    serviceReport: 'Both units cleaned. Drain line flushed. Gas pressure optimal. Cooling verified at 16C.', additionalQuote: null, additionalQuoteStatus: 'None', reviewId: 'rev-001', disputeId: null,
  },
  {
    id: 'bk-002', number: 'VSR-1002', customerId: 'cust-002', customerName: 'Meera Krishnan', serviceId: 'svc-plumb-02', packageId: 'pkg-plumb-02-s', addOnIds: [],
    cityId: 'del', localityId: 'del-09', addressLine: 'C-42, Vasant Kunj', scheduledStart: '2026-08-18T14:00:00', expectedEnd: '2026-08-18T16:30:00',
    status: 'InService', assignedProfessionalId: 'pro-004', originalQuote: 649, currentQuote: 799, paymentStatus: 'Paid', paymentMethod: 'Card',
    customerNotes: 'Kitchen sink and bathroom drain both blocked.', createdAt: '2026-08-17T11:00:00', updatedAt: '2026-08-18T14:40:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-17T11:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-17T11:00:12', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-17T11:02:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-17T11:05:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-18T13:40:00', changedBy: 'Professional' },
      { from: 'OnTheWay', to: 'Arrived', changedAt: '2026-08-18T13:58:00', changedBy: 'Professional' },
      { from: 'Arrived', to: 'InService', changedAt: '2026-08-18T14:05:00', changedBy: 'Professional' },
      { from: 'InService', to: 'WaitingCustomerApproval', changedAt: '2026-08-18T14:35:00', changedBy: 'Professional', reason: 'Additional drain machine service' },
      { from: 'WaitingCustomerApproval', to: 'InService', changedAt: '2026-08-18T14:38:00', changedBy: 'Customer', reason: 'Approved' },
    ],
    emergency: false, checklist: ['Kitchen drain cleared', 'Bathroom drain cleared', 'Machine jetting done'], beforePhotos: ['before-plumb-2.jpg'], afterPhotos: [],
    serviceReport: null, additionalQuote: 150, additionalQuoteStatus: 'Approved', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-003', number: 'VSR-1003', customerId: 'cust-003', customerName: 'Kabir Malhotra', serviceId: 'svc-clean-01', packageId: 'pkg-clean-01-s', addOnIds: [],
    cityId: 'del', localityId: 'del-01', addressLine: 'Flat 302, Connaught Place', scheduledStart: '2026-08-19T09:00:00', expectedEnd: '2026-08-19T15:00:00',
    status: 'Upcoming', assignedProfessionalId: 'pro-012', originalQuote: 2499, currentQuote: 2499, paymentStatus: 'Paid', paymentMethod: 'UPI',
    customerNotes: '', createdAt: '2026-08-16T16:20:00', updatedAt: '2026-08-16T16:20:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-16T16:20:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-16T16:20:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-16T16:22:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-16T16:25:00', changedBy: 'Professional' },
    ],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-004', number: 'VSR-1004', customerId: 'cust-004', customerName: 'Sanya Kapoor', serviceId: 'svc-elec-04', packageId: 'pkg-elec-04-s', addOnIds: ['add-05'],
    cityId: 'ggn', localityId: 'ggn-01', addressLine: 'Tower A, 1401, Sector 14', scheduledStart: '2026-08-18T19:30:00', expectedEnd: '2026-08-18T22:30:00',
    status: 'OnTheWay', assignedProfessionalId: 'pro-002', originalQuote: 1499, currentQuote: 1499, paymentStatus: 'Paid', paymentMethod: 'UPI',
    customerNotes: 'Power keeps tripping in the living room.', createdAt: '2026-08-18T17:00:00', updatedAt: '2026-08-18T19:10:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-18T17:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-18T17:00:08', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-18T17:01:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-18T17:03:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-18T19:05:00', changedBy: 'Professional' },
    ],
    emergency: true, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-005', number: 'VSR-1005', customerId: 'cust-001', customerName: 'Aarav Sharma', serviceId: 'svc-app-01', packageId: 'pkg-app-01-s', addOnIds: [],
    cityId: 'del', localityId: 'del-03', addressLine: 'B-14, Second Floor, Lajpat Nagar II', scheduledStart: '2026-08-20T11:00:00', expectedEnd: '2026-08-20T14:00:00',
    status: 'AwaitingProvider', assignedProfessionalId: null, originalQuote: 999, currentQuote: 999, paymentStatus: 'Paid', paymentMethod: 'Card',
    customerNotes: 'Washing machine not draining.', createdAt: '2026-08-18T10:30:00', updatedAt: '2026-08-18T10:32:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-18T10:30:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-18T10:30:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-18T10:32:00', changedBy: 'System', reason: 'No provider available for slot yet' },
    ],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-006', number: 'VSR-1006', customerId: 'cust-002', customerName: 'Meera Krishnan', serviceId: 'svc-elec-01', packageId: 'pkg-elec-01-s', addOnIds: [],
    cityId: 'del', localityId: 'del-09', addressLine: 'C-42, Vasant Kunj', scheduledStart: '2026-08-17T16:00:00', expectedEnd: '2026-08-17T17:30:00',
    status: 'Completed', assignedProfessionalId: 'pro-003', originalQuote: 499, currentQuote: 499, paymentStatus: 'Paid', paymentMethod: 'UPI',
    customerNotes: '', createdAt: '2026-08-14T12:00:00', updatedAt: '2026-08-17T17:40:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-14T12:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-14T12:00:12', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-14T12:03:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-14T12:05:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-17T15:40:00', changedBy: 'Professional' },
      { from: 'OnTheWay', to: 'Arrived', changedAt: '2026-08-17T15:58:00', changedBy: 'Professional' },
      { from: 'Arrived', to: 'InService', changedAt: '2026-08-17T16:03:00', changedBy: 'Professional' },
      { from: 'InService', to: 'PaymentPending', changedAt: '2026-08-17T17:25:00', changedBy: 'Professional' },
      { from: 'PaymentPending', to: 'Completed', changedAt: '2026-08-17T17:35:00', changedBy: 'System' },
    ],
    emergency: false, checklist: ['3 switches repaired', 'Safety check done'], beforePhotos: [], afterPhotos: ['after-elec-1.jpg'], serviceReport: 'Repaired 3 switches in living room and kitchen.', additionalQuote: null, additionalQuoteStatus: 'None', reviewId: 'rev-002', disputeId: null,
  },
  {
    id: 'bk-007', number: 'VSR-1007', customerId: 'cust-003', customerName: 'Kabir Malhotra', serviceId: 'svc-plumb-03', packageId: 'pkg-plumb-03-b', addOnIds: [],
    cityId: 'del', localityId: 'del-01', addressLine: 'Flat 302, Connaught Place', scheduledStart: '2026-08-16T10:00:00', expectedEnd: '2026-08-16T12:30:00',
    status: 'Cancelled', assignedProfessionalId: 'pro-005', originalQuote: 599, currentQuote: 0, paymentStatus: 'Refunded', paymentMethod: 'UPI',
    customerNotes: 'Water leak from bathroom ceiling.', createdAt: '2026-08-15T09:00:00', updatedAt: '2026-08-15T18:30:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-15T09:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-15T09:00:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-15T09:02:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-15T09:05:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'Cancelled', changedAt: '2026-08-15T18:30:00', changedBy: 'Customer', reason: 'Personal reason' },
    ],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-008', number: 'VSR-1008', customerId: 'cust-004', customerName: 'Sanya Kapoor', serviceId: 'svc-clean-04', packageId: 'pkg-clean-04-s', addOnIds: [],
    cityId: 'ggn', localityId: 'ggn-01', addressLine: 'Tower A, 1401, Sector 14', scheduledStart: '2026-08-18T11:00:00', expectedEnd: '2026-08-18T14:00:00',
    status: 'Completed', assignedProfessionalId: 'pro-014', originalQuote: 1699, currentQuote: 1699, paymentStatus: 'Paid', paymentMethod: 'Card',
    customerNotes: 'Cockroach problem mainly in kitchen.', createdAt: '2026-08-13T14:00:00', updatedAt: '2026-08-18T14:15:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-13T14:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-13T14:00:08', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-13T14:03:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-13T14:06:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-18T10:40:00', changedBy: 'Professional' },
      { from: 'OnTheWay', to: 'Arrived', changedAt: '2026-08-18T10:55:00', changedBy: 'Professional' },
      { from: 'Arrived', to: 'InService', changedAt: '2026-08-18T11:02:00', changedBy: 'Professional' },
      { from: 'InService', to: 'PaymentPending', changedAt: '2026-08-18T13:55:00', changedBy: 'Professional' },
      { from: 'PaymentPending', to: 'Completed', changedAt: '2026-08-18T14:05:00', changedBy: 'System' },
    ],
    emergency: false, checklist: ['Kitchen gel applied', 'Bathroom spray done', 'Follow-up scheduled'], beforePhotos: [], afterPhotos: [], serviceReport: 'Gel and spray applied across kitchen and bathrooms. Follow-up visit in 21 days.', additionalQuote: null, additionalQuoteStatus: 'None', reviewId: 'rev-003', disputeId: null,
  },
  {
    id: 'bk-009', number: 'VSR-1009', customerId: 'cust-001', customerName: 'Aarav Sharma', serviceId: 'svc-carp-01', packageId: 'pkg-carp-01-s', addOnIds: [],
    cityId: 'del', localityId: 'del-03', addressLine: 'B-14, Second Floor, Lajpat Nagar II', scheduledStart: '2026-08-21T12:00:00', expectedEnd: '2026-08-21T15:30:00',
    status: 'New', assignedProfessionalId: null, originalQuote: 999, currentQuote: 999, paymentStatus: 'Pending', paymentMethod: 'UPI',
    customerNotes: 'New wardrobe and study table assembly.', createdAt: '2026-08-18T12:45:00', updatedAt: '2026-08-18T12:45:00',
    history: [{ from: null, to: 'New', changedAt: '2026-08-18T12:45:00', changedBy: 'Customer' }],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-010', number: 'VSR-1010', customerId: 'cust-002', customerName: 'Meera Krishnan', serviceId: 'svc-ac-02', packageId: 'pkg-ac-02-s', addOnIds: [],
    cityId: 'del', localityId: 'del-09', addressLine: 'C-42, Vasant Kunj', scheduledStart: '2026-08-18T09:00:00', expectedEnd: '2026-08-18T12:00:00',
    status: 'Problem', assignedProfessionalId: 'pro-007', originalQuote: 1199, currentQuote: 1498, paymentStatus: 'Paid', paymentMethod: 'Card',
    customerNotes: 'AC not cooling since yesterday.', createdAt: '2026-08-17T13:00:00', updatedAt: '2026-08-18T11:20:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-17T13:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-17T13:00:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-17T13:02:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-17T13:05:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'OnTheWay', changedAt: '2026-08-18T08:40:00', changedBy: 'Professional' },
      { from: 'OnTheWay', to: 'Arrived', changedAt: '2026-08-18T08:55:00', changedBy: 'Professional' },
      { from: 'Arrived', to: 'InService', changedAt: '2026-08-18T09:02:00', changedBy: 'Professional' },
      { from: 'InService', to: 'Problem', changedAt: '2026-08-18T11:20:00', changedBy: 'System', reason: 'Compressor part not available on-site; needs follow-up visit' },
    ],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-011', number: 'VSR-1011', customerId: 'cust-003', customerName: 'Kabir Malhotra', serviceId: 'svc-water-01', packageId: 'pkg-water-01-b', addOnIds: [],
    cityId: 'del', localityId: 'del-01', addressLine: 'Flat 302, Connaught Place', scheduledStart: '2026-08-22T10:00:00', expectedEnd: '2026-08-22T18:00:00',
    status: 'SearchingProvider', assignedProfessionalId: null, originalQuote: 1999, currentQuote: 1999, paymentStatus: 'Pending', paymentMethod: 'UPI',
    customerNotes: 'Seepage in master bathroom.', createdAt: '2026-08-18T15:10:00', updatedAt: '2026-08-18T15:10:00',
    history: [{ from: null, to: 'New', changedAt: '2026-08-18T15:10:00', changedBy: 'Customer' }, { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-18T15:10:15', changedBy: 'System' }],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
  {
    id: 'bk-012', number: 'VSR-1012', customerId: 'cust-004', customerName: 'Sanya Kapoor', serviceId: 'svc-paint-01', packageId: 'pkg-paint-01-b', addOnIds: [],
    cityId: 'ggn', localityId: 'ggn-01', addressLine: 'Tower A, 1401, Sector 14', scheduledStart: '2026-08-24T09:00:00', expectedEnd: '2026-08-24T21:00:00',
    status: 'AwaitingProvider', assignedProfessionalId: 'pro-015', originalQuote: 3499, currentQuote: 3499, paymentStatus: 'Paid', paymentMethod: 'Card',
    customerNotes: 'Master bedroom painting.', createdAt: '2026-08-16T10:00:00', updatedAt: '2026-08-16T10:30:00',
    history: [
      { from: null, to: 'New', changedAt: '2026-08-16T10:00:00', changedBy: 'Customer' },
      { from: 'New', to: 'SearchingProvider', changedAt: '2026-08-16T10:00:10', changedBy: 'System' },
      { from: 'SearchingProvider', to: 'AwaitingProvider', changedAt: '2026-08-16T10:05:00', changedBy: 'System' },
      { from: 'AwaitingProvider', to: 'Upcoming', changedAt: '2026-08-16T10:30:00', changedBy: 'Professional' },
      { from: 'Upcoming', to: 'AwaitingProvider', changedAt: '2026-08-18T09:00:00', changedBy: 'Professional', reason: 'Professional requested reschedule to 24th' },
    ],
    emergency: false, checklist: [], beforePhotos: [], afterPhotos: [], serviceReport: null, additionalQuote: null, additionalQuoteStatus: 'None', reviewId: null, disputeId: null,
  },
]

export type Review = {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  professionalId: string
  rating: number
  comment: string
  createdAt: string
}

export const REVIEWS: readonly Review[] = [
  { id: 'rev-001', bookingId: 'bk-001', customerId: 'cust-001', customerName: 'Aarav Sharma', professionalId: 'pro-001', rating: 5, comment: 'Very professional. AC is working much better now.', createdAt: '2026-08-18T12:00:00' },
  { id: 'rev-002', bookingId: 'bk-006', customerId: 'cust-002', customerName: 'Meera Krishnan', professionalId: 'pro-003', rating: 4, comment: 'Good work, arrived slightly late but finished well.', createdAt: '2026-08-17T19:00:00' },
  { id: 'rev-003', bookingId: 'bk-008', customerId: 'cust-004', customerName: 'Sanya Kapoor', professionalId: 'pro-014', rating: 5, comment: 'Cockroach problem solved. Explained the follow-up clearly.', createdAt: '2026-08-18T15:00:00' },
]

export type SupportTicket = {
  id: string
  ticketNumber: string
  customerId: string
  customerName: string
  subject: string
  description: string
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  createdAt: string
  updatedAt: string
}

export const SUPPORT_TICKETS: readonly SupportTicket[] = [
  { id: 'tkt-001', ticketNumber: 'SUP-2001', customerId: 'cust-001', customerName: 'Aarav Sharma', subject: 'Invoice not received', description: "I completed booking VSR-1001 but haven't received the invoice email.", status: 'Open', priority: 'Medium', createdAt: '2026-08-18T13:00:00', updatedAt: '2026-08-18T13:00:00' },
  { id: 'tkt-002', ticketNumber: 'SUP-2002', customerId: 'cust-003', customerName: 'Kabir Malhotra', subject: 'Refund status', description: 'My cancelled booking VSR-1007 refund has not arrived yet.', status: 'InProgress', priority: 'High', createdAt: '2026-08-16T09:00:00', updatedAt: '2026-08-18T10:00:00' },
]

export type Dispute = {
  id: string
  disputeNumber: string
  bookingId: string
  customerId: string
  customerName: string
  professionalId: string
  reason: string
  status: 'Open' | 'UnderReview' | 'Resolved' | 'Closed'
  resolution: string | null
  createdAt: string
  updatedAt: string
}

export const DISPUTES: readonly Dispute[] = [
  { id: 'dsp-001', disputeNumber: 'DSP-3001', bookingId: 'bk-010', customerId: 'cust-002', customerName: 'Meera Krishnan', professionalId: 'pro-007', reason: 'AC issue not fully fixed, technician left saying part needed.', status: 'Open', resolution: null, createdAt: '2026-08-18T12:00:00', updatedAt: '2026-08-18T12:00:00' },
]

export type Notification = {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  read: boolean
  kind: 'booking' | 'payment' | 'promo' | 'system'
}

export const NOTIFICATIONS: readonly Notification[] = [
  { id: 'ntf-001', userId: 'cust-001', title: 'Booking completed', body: 'Your AC service VSR-1001 was completed successfully.', createdAt: '2026-08-18T11:40:00', read: false, kind: 'booking' },
  { id: 'ntf-002', userId: 'cust-001', title: 'Professional on the way', body: 'Carpenter is on the way for your booking VSR-1009.', createdAt: '2026-08-18T12:40:00', read: false, kind: 'booking' },
  { id: 'ntf-003', userId: 'cust-001', title: 'Weekend offer', body: 'Get 10% off electrical services this weekend with code WEEKEND.', createdAt: '2026-08-18T09:00:00', read: true, kind: 'promo' },
  { id: 'ntf-004', userId: 'cust-002', title: 'Payment confirmed', body: 'Your payment of ₹799 for booking VSR-1002 is confirmed.', createdAt: '2026-08-17T11:05:00', read: false, kind: 'payment' },
]

// ---------------------------------------------------------------------------
// Customers (doc #152)
// ---------------------------------------------------------------------------

export type Customer = {
  id: string
  name: string
  phone: string
  email: string
  cityId: string
  membershipId: string | null
  memberSince: string
  bookingsCount: number
}

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cust-001', name: 'Aarav Sharma', phone: '98450 22190', email: 'aarav.sharma@example.com', cityId: 'del', membershipId: 'mem-02', memberSince: '2024-03-10', bookingsCount: 24 },
  { id: 'cust-002', name: 'Meera Krishnan', phone: '91234 56780', email: 'meera.k@example.com', cityId: 'del', membershipId: null, memberSince: '2025-01-22', bookingsCount: 11 },
  { id: 'cust-003', name: 'Kabir Malhotra', phone: '98888 12345', email: 'kabir.m@example.com', cityId: 'del', membershipId: 'mem-01', memberSince: '2024-11-05', bookingsCount: 17 },
  { id: 'cust-004', name: 'Sanya Kapoor', phone: '97777 54321', email: 'sanya.k@example.com', cityId: 'ggn', membershipId: 'mem-03', memberSince: '2024-06-18', bookingsCount: 31 },
]

// ---------------------------------------------------------------------------
// Earnings / payouts / commission (doc #90-#95)
// ---------------------------------------------------------------------------

export type ProfessionalEarning = {
  id: string
  professionalId: string
  bookingId: string
  bookingNumber: string
  grossAmount: number
  commissionPct: number
  commissionAmount: number
  earningAmount: number
  status: 'Eligible' | 'Paid'
  createdAt: string
}

export const EARNINGS_SEED: readonly ProfessionalEarning[] = [
  { id: 'ern-001', professionalId: 'pro-001', bookingId: 'bk-001', bookingNumber: 'VSR-1001', grossAmount: 1298, commissionPct: 15, commissionAmount: 195, earningAmount: 1103, status: 'Eligible', createdAt: '2026-08-18T11:40:00' },
  { id: 'ern-002', professionalId: 'pro-004', bookingId: 'bk-002', bookingNumber: 'VSR-1002', grossAmount: 799, commissionPct: 15, commissionAmount: 120, earningAmount: 679, status: 'Eligible', createdAt: '2026-08-18T14:45:00' },
  { id: 'ern-003', professionalId: 'pro-003', bookingId: 'bk-006', bookingNumber: 'VSR-1006', grossAmount: 499, commissionPct: 15, commissionAmount: 75, earningAmount: 424, status: 'Paid', createdAt: '2026-08-17T17:40:00' },
  { id: 'ern-004', professionalId: 'pro-014', bookingId: 'bk-008', bookingNumber: 'VSR-1008', grossAmount: 1699, commissionPct: 15, commissionAmount: 255, earningAmount: 1444, status: 'Eligible', createdAt: '2026-08-18T14:15:00' },
]

export type Payout = {
  id: string
  professionalId: string
  amount: number
  status: 'Pending' | 'Processing' | 'Paid' | 'Failed'
  method: string
  reference: string
  createdAt: string
  paidAt: string | null
}

export const PAYOUTS_SEED: readonly Payout[] = [
  { id: 'pout-001', professionalId: 'pro-003', amount: 424, status: 'Paid', method: 'Bank Transfer', reference: 'UTR-88213301', createdAt: '2026-08-17T18:00:00', paidAt: '2026-08-17T20:00:00' },
  { id: 'pout-002', professionalId: 'pro-001', amount: 5000, status: 'Processing', method: 'Bank Transfer', reference: 'UTR-88213455', createdAt: '2026-08-18T12:00:00', paidAt: null },
  { id: 'pout-003', professionalId: 'pro-007', amount: 3400, status: 'Pending', method: 'Bank Transfer', reference: '', createdAt: '2026-08-18T12:30:00', paidAt: null },
]

export type CommissionRule = {
  id: string
  categoryId: string | null
  commissionPct: number
  effectiveFrom: string
}

export const COMMISSION_RULES: readonly CommissionRule[] = [
  { id: 'cmr-01', categoryId: null, commissionPct: 15, effectiveFrom: '2026-01-01' },
  { id: 'cmr-02', categoryId: 'cat-paint', commissionPct: 10, effectiveFrom: '2026-01-01' },
  { id: 'cmr-03', categoryId: 'cat-water', commissionPct: 12, effectiveFrom: '2026-01-01' },
]

// ---------------------------------------------------------------------------
// Availability slots (doc #58-#59)
// ---------------------------------------------------------------------------

export type AvailabilitySlot = {
  id: string
  professionalId: string
  date: string
  start: string // "10:00"
  end: string // "11:00"
  status: 'Available' | 'Booked' | 'Blocked'
}

export function buildAvailabilitySlots(professionalId: string, fromDate: string, days = 7, bookFrom = '09:00', bookTo = '20:00'): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []
  const [year, month, day] = fromDate.split('-').map(Number)
  const base = new Date(year, month - 1, day)
  for (let d = 0; d < days; d += 1) {
    const date = new Date(base)
    date.setDate(base.getDate() + d)
    const dateKey = date.toISOString().slice(0, 10)
    const [startH, endH] = [Number(bookFrom.split(':')[0]), Number(bookTo.split(':')[0])]
    for (let h = startH; h < endH; h += 1) {
      slots.push({
        id: `${professionalId}-${dateKey}-${String(h).padStart(2, '0')}:00`,
        professionalId,
        date: dateKey,
        start: `${String(h).padStart(2, '0')}:00`,
        end: `${String(h + 1).padStart(2, '0')}:00`,
        status: 'Available',
      })
    }
  }
  return slots
}