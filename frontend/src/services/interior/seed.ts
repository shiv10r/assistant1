import type {
  InteriorClient, InteriorProject, InteriorRoom, InteriorDesign, InteriorProduct, InteriorTask, InteriorProcurement, InteriorDecision,
} from './types'

export const CLIENT_SEED: InteriorClient[] = [
  { id: 'int-client-1', name: 'Aarav Mehta', email: 'aarav@example.com', phone: '+91 98111 22334', address: 'Mumbai, Maharashtra', status: 'active', createdAt: '2026-07-20T10:00:00.000Z' },
  { id: 'int-client-2', name: 'Mira Shah', email: 'mira@example.com', phone: '+91 98222 33445', address: 'Pune, Maharashtra', status: 'active', createdAt: '2026-07-25T10:00:00.000Z' },
  { id: 'int-client-3', name: 'Rohan Iyer', email: 'rohan@example.com', phone: '+91 98333 44556', address: 'Bengaluru, Karnataka', status: 'active', createdAt: '2026-06-10T10:00:00.000Z' },
]

export const PROJECT_SEED: InteriorProject[] = [
  {
    id: 'int-proj-1',
    name: 'Living Room Renovation',
    propertyType: 'Apartment',
    location: 'Mumbai, Maharashtra',
    totalArea: 320,
    budget: 250000,
    status: 'active',
    createdAt: '2026-07-28T10:00:00.000Z',
    clientId: 'int-client-1', clientName: 'Aarav Mehta', leadDesigner: 'Nisha Rao', phase: 'Design Development', priority: 'signature', progress: 58,
    targetDate: '2026-10-18', latitude: '19.0760', longitude: '72.8777',
  },
  {
    id: 'int-proj-2',
    name: 'Master Bedroom Redesign',
    propertyType: 'Villa',
    location: 'Pune, Maharashtra',
    totalArea: 260,
    budget: 180000,
    status: 'active',
    createdAt: '2026-08-02T09:30:00.000Z',
    clientId: 'int-client-2', clientName: 'Mira Shah', leadDesigner: 'Kabir Sen', phase: 'Concept', priority: 'priority', progress: 34,
    targetDate: '2026-11-06', latitude: '18.5204', longitude: '73.8567',
  },
  {
    id: 'int-proj-3',
    name: 'Kitchen & Dining Upgrade',
    propertyType: 'House',
    location: 'Bengaluru, Karnataka',
    totalArea: 210,
    budget: 300000,
    status: 'completed',
    createdAt: '2026-06-15T12:00:00.000Z',
    clientId: 'int-client-3', clientName: 'Rohan Iyer', leadDesigner: 'Nisha Rao', phase: 'Handover', priority: 'standard', progress: 100,
    targetDate: '2026-08-12', latitude: '12.9716', longitude: '77.5946',
  },
]

export const ROOM_SEED: InteriorRoom[] = [
  {
    id: 'int-room-1',
    projectId: 'int-proj-1',
    name: 'Living Room',
    roomType: 'Living Room',
    length: 15,
    width: 12,
    height: 10,
    budget: 120000,
    notes: 'South-facing with a large balcony window.',
    createdAt: '2026-07-28T10:10:00.000Z',
  },
  {
    id: 'int-room-2',
    projectId: 'int-proj-1',
    name: 'TV Lounge Corner',
    roomType: 'Living Room',
    length: 10,
    width: 8,
    height: 10,
    budget: 60000,
    notes: 'Adjacent to the main living area.',
    createdAt: '2026-07-29T11:00:00.000Z',
  },
  {
    id: 'int-room-3',
    projectId: 'int-proj-2',
    name: 'Master Bedroom',
    roomType: 'Master Bedroom',
    length: 14,
    width: 12,
    height: 9,
    budget: 100000,
    notes: 'Needs a walk-in wardrobe corner.',
    createdAt: '2026-08-02T09:45:00.000Z',
  },
  {
    id: 'int-room-4',
    projectId: 'int-proj-3',
    name: 'Kitchen',
    roomType: 'Kitchen',
    length: 12,
    width: 10,
    height: 10,
    budget: 150000,
    createdAt: '2026-06-15T12:10:00.000Z',
  },
]

export const DESIGN_SEED: InteriorDesign[] = [
  {
    id: 'int-des-1',
    projectId: 'int-proj-1',
    roomId: 'int-room-1',
    name: 'Modern Living Room',
    style: 'Modern',
    color: 'Grey',
    budget: 120000,
    status: 'completed',
    favorite: true,
    saved: true,
    createdAt: '2026-07-30T14:00:00.000Z',
    currentVersion: 2,
    versions: [
      {
        id: 'int-ver-1-1',
        version: 1,
        style: 'Modern',
        color: 'Grey',
        budget: 120000,
        prompt: 'I want an L-shaped sofa, TV unit and warm lighting.',
        productIds: ['int-prod-1', 'int-prod-4', 'int-prod-9'],
        createdAt: '2026-07-30T14:00:00.000Z',
      },
      {
        id: 'int-ver-1-2',
        version: 2,
        style: 'Modern',
        color: 'Grey',
        budget: 128000,
        prompt: 'Make the sofa blue and add indoor plants.',
        productIds: ['int-prod-2', 'int-prod-4', 'int-prod-9', 'int-prod-14'],
        createdAt: '2026-07-30T15:30:00.000Z',
      },
    ],
  },
  {
    id: 'int-des-2',
    projectId: 'int-proj-1',
    roomId: 'int-room-1',
    name: 'Minimal Scandinavian Lounge',
    style: 'Scandinavian',
    color: 'Beige',
    budget: 98000,
    status: 'completed',
    favorite: false,
    saved: false,
    createdAt: '2026-07-30T16:00:00.000Z',
    currentVersion: 1,
    versions: [
      {
        id: 'int-ver-2-1',
        version: 1,
        style: 'Scandinavian',
        color: 'Beige',
        budget: 98000,
        prompt: 'Light wood tones and lots of natural light.',
        productIds: ['int-prod-3', 'int-prod-8', 'int-prod-11'],
        createdAt: '2026-07-30T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'int-des-3',
    projectId: 'int-proj-2',
    roomId: 'int-room-3',
    name: 'Luxury Bedroom Suite',
    style: 'Luxury',
    color: 'White',
    budget: 100000,
    status: 'completed',
    favorite: true,
    saved: true,
    createdAt: '2026-08-03T10:00:00.000Z',
    currentVersion: 1,
    versions: [
      {
        id: 'int-ver-3-1',
        version: 1,
        style: 'Luxury',
        color: 'White',
        budget: 100000,
        prompt: 'Elegant, plush and premium finishes.',
        productIds: ['int-prod-6', 'int-prod-10', 'int-prod-12'],
        createdAt: '2026-08-03T10:00:00.000Z',
      },
    ],
  },
]

export const PRODUCT_SEED: InteriorProduct[] = [
  // Furniture
  { id: 'int-prod-1', name: 'Modern 3-Seater Sofa', category: 'Furniture', price: 55000, material: 'Fabric', color: 'Grey', width: '7 ft', depth: '3 ft', description: 'Compact L-shaped section with removable cushions.' },
  { id: 'int-prod-2', name: 'Blue Velvet Sofa', category: 'Furniture', price: 64000, material: 'Velvet', color: 'Blue', width: '7.5 ft', depth: '3.2 ft', description: 'Deep-buttoned backrest with solid teak frame.' },
  { id: 'int-prod-3', name: 'Scandinavian Armchair', category: 'Furniture', price: 18500, material: 'Wood + Fabric', color: 'Beige', width: '2.5 ft', depth: '2.5 ft', description: 'Light oak legs with a curved backrest.' },
  { id: 'int-prod-4', name: 'Wall-Mounted TV Unit', category: 'Furniture', price: 30000, material: 'Engineered Wood', color: 'Walnut', width: '6 ft', depth: '1.5 ft', description: 'Floating console with cable management.' },
  { id: 'int-prod-5', name: 'Dining Table (6-Seater)', category: 'Furniture', price: 48000, material: 'Solid Wood', color: 'Wood', width: '6 ft', depth: '3 ft', description: 'Extendable table with six upholstered chairs.' },
  { id: 'int-prod-6', name: 'Upholstered King Bed', category: 'Bedroom', price: 72000, material: 'Velvet', color: 'White', width: '6 ft', depth: '6.5 ft', description: 'Tufted headboard with hydraulic storage.' },
  { id: 'int-prod-7', name: 'Wardrobe (4-Door)', category: 'Bedroom', price: 56000, material: 'MDF Laminate', color: 'White', width: '8 ft', depth: '2 ft', description: 'Sliding doors with internal organisers.' },
  // Lighting
  { id: 'int-prod-8', name: 'Pendant Ceiling Light', category: 'Lighting', price: 12000, material: 'Metal + Glass', color: 'Brass', description: 'Dimmable warm-white pendant for dining areas.' },
  { id: 'int-prod-9', name: 'Floor Lamp (Arc)', category: 'Lighting', price: 8500, material: 'Steel', color: 'Black', description: 'Arc floor lamp with marble base.' },
  { id: 'int-prod-10', name: 'Crystal Chandelier', category: 'Lighting', price: 22000, material: 'Crystal', color: 'Clear', description: '8-light chandelier with polished finish.' },
  { id: 'int-prod-11', name: 'LED Cove Lighting Kit', category: 'Lighting', price: 6500, material: 'Aluminium', color: 'White', description: 'Warm 3000K strips for ceiling coves.' },
  // Decor
  { id: 'int-prod-12', name: 'Abstract Wall Art Set', category: 'Decor', price: 9500, material: 'Canvas', color: 'Mixed', description: 'Set of three framed abstract prints.' },
  { id: 'int-prod-13', name: 'Ceramic Table Vase', category: 'Decor', price: 3200, material: 'Ceramic', color: 'Beige', description: 'Hand-finished matte ceramic vase.' },
  { id: 'int-prod-14', name: 'Indoor Plant Bundle', category: 'Decor', price: 4500, material: 'Natural', color: 'Green', description: 'Three low-maintenance indoor plants with pots.' },
  // Flooring
  { id: 'int-prod-15', name: 'Vitrified Floor Tiles', category: 'Flooring', price: 68, material: 'Vitrified', color: 'Grey', width: '2 ft', depth: '2 ft', description: 'Per sq ft — matte finish anti-skid tiles.' },
  { id: 'int-prod-16', name: 'Engineered Wood Flooring', category: 'Flooring', price: 145, material: 'Oak', color: 'Wood', description: 'Per sq ft — click-lock oak veneer planks.' },
  // Wall
  { id: 'int-prod-17', name: 'Textured Wallpaper', category: 'Wall', price: 90, material: 'Vinyl', color: 'Beige', description: 'Per sq ft — washable textured wallpaper.' },
  { id: 'int-prod-18', name: 'Premium Emulsion Paint', category: 'Wall', price: 42, material: 'Acrylic', color: 'White', description: 'Per sq ft — low-VOC washable emulsion.' },
  // Kitchen
  { id: 'int-prod-19', name: 'Modular Kitchen Unit', category: 'Kitchen', price: 95000, material: 'Plywood + Laminate', color: 'Walnut', description: 'Base + tall units with quartz countertop.' },
  { id: 'int-prod-20', name: 'Chimney & Hob Combo', category: 'Kitchen', price: 26000, material: 'Stainless Steel', color: 'Silver', description: 'Auto-clean chimney with 3-burner hob.' },
]

export const TASK_SEED: InteriorTask[] = [
  { id: 'int-task-1', projectId: 'int-proj-1', title: 'Freeze living room material palette', phase: 'Design Development', owner: 'Nisha Rao', dueDate: '2026-08-27', status: 'in-progress', progress: 70 },
  { id: 'int-task-2', projectId: 'int-proj-1', title: 'Issue reflected ceiling drawings', phase: 'Design Development', owner: 'Arjun Patel', dueDate: '2026-08-30', status: 'not-started', progress: 10 },
  { id: 'int-task-3', projectId: 'int-proj-2', title: 'Client concept presentation', phase: 'Concept', owner: 'Kabir Sen', dueDate: '2026-08-26', status: 'in-progress', progress: 80 },
  { id: 'int-task-4', projectId: 'int-proj-2', title: 'Verify wardrobe site dimensions', phase: 'Concept', owner: 'Site Team', dueDate: '2026-08-25', status: 'blocked', progress: 35 },
  { id: 'int-task-5', projectId: 'int-proj-3', title: 'Close handover snag list', phase: 'Handover', owner: 'Nisha Rao', dueDate: '2026-08-12', status: 'completed', progress: 100 },
]

export const PROCUREMENT_SEED: InteriorProcurement[] = [
  { id: 'int-proc-1', projectId: 'int-proj-1', item: 'Custom sectional sofa', category: 'Furniture', vendor: 'Forma Living', amount: 64000, expectedDate: '2026-09-08', status: 'ordered' },
  { id: 'int-proc-2', projectId: 'int-proj-1', item: 'Oak engineered flooring', category: 'Flooring', vendor: 'Woodcraft India', amount: 52200, expectedDate: '2026-09-02', status: 'in-transit' },
  { id: 'int-proc-3', projectId: 'int-proj-2', item: 'Wardrobe hardware set', category: 'Bedroom', vendor: 'Hafele Partner', amount: 28500, expectedDate: '2026-09-18', status: 'quoted' },
  { id: 'int-proc-4', projectId: 'int-proj-2', item: 'Decorative pendant lights', category: 'Lighting', vendor: 'Luma Studio', amount: 22000, expectedDate: '2026-09-10', status: 'delayed' },
]

export const DECISION_SEED: InteriorDecision[] = [
  { id: 'int-dec-1', projectId: 'int-proj-1', title: 'Approve final sofa fabric', requestedFrom: 'Aarav Mehta', dueDate: '2026-08-26', status: 'pending' },
  { id: 'int-dec-2', projectId: 'int-proj-1', title: 'Confirm entertainment wall finish', requestedFrom: 'Aarav Mehta', dueDate: '2026-08-29', status: 'approved' },
  { id: 'int-dec-3', projectId: 'int-proj-2', title: 'Select master bedroom palette', requestedFrom: 'Mira Shah', dueDate: '2026-08-27', status: 'changes-requested' },
]
