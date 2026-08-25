// ── Interior Design service entities ───────────────────────────────────────

export type PropertyType = 'Apartment' | 'Villa' | 'House' | 'Office' | 'Commercial' | 'Other'

export type RoomType = 'Living Room' | 'Master Bedroom' | 'Kitchen' | 'Bathroom' | 'Dining Room' | 'Study' | 'Other'

export type ProjectStatus = 'active' | 'completed' | 'archived'

export type InteriorPhase = 'Discovery' | 'Concept' | 'Design Development' | 'Procurement' | 'Execution' | 'Handover'

export type InteriorPriority = 'standard' | 'priority' | 'signature'

export interface InteriorClient {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'lead' | 'active' | 'inactive'
  createdAt: string
}

export interface InteriorProject {
  id: string
  name: string
  propertyType: PropertyType
  location: string
  totalArea: number // sq ft
  budget: number
  status: ProjectStatus
  createdAt: string
  clientId?: string
  clientName?: string
  leadDesigner?: string
  phase?: InteriorPhase
  priority?: InteriorPriority
  progress?: number
  targetDate?: string
  latitude?: string
  longitude?: string
}

export interface InteriorRoom {
  id: string
  projectId: string
  name: string
  roomType: RoomType
  length: number // ft
  width: number // ft
  height: number // ft
  budget: number
  notes?: string
  image?: string // data URL of the uploaded room photo
  createdAt: string
}

// ── AI Design ──────────────────────────────────────────────────────────────

export type DesignStyle = 'Modern' | 'Minimal' | 'Luxury' | 'Scandinavian' | 'Traditional' | 'Industrial' | 'Contemporary'

export type DesignColor = 'White' | 'Beige' | 'Grey' | 'Wood' | 'Blue' | 'Green' | 'Custom'

export type DesignStatus = 'generating' | 'completed' | 'failed'

export interface DesignVersion {
  id: string
  version: number
  style: DesignStyle
  color: DesignColor
  budget: number
  prompt: string
  productIds: string[]
  createdAt: string
}

export interface InteriorDesign {
  id: string
  projectId: string
  roomId: string
  name: string
  style: DesignStyle
  color: DesignColor
  budget: number
  status: DesignStatus
  favorite: boolean
  saved: boolean
  versions: DesignVersion[]
  currentVersion: number
  createdAt: string
}

// ── Product catalog ────────────────────────────────────────────────────────

export type ProductCategory = 'Furniture' | 'Lighting' | 'Decor' | 'Flooring' | 'Wall' | 'Kitchen' | 'Bedroom'

export interface InteriorProduct {
  id: string
  name: string
  category: ProductCategory
  price: number
  material?: string
  color?: string
  width?: string
  depth?: string
  description?: string
}

export type InteriorTaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed'

export interface InteriorTask {
  id: string
  projectId: string
  title: string
  phase: InteriorPhase
  owner: string
  dueDate: string
  status: InteriorTaskStatus
  progress: number
}

export type ProcurementStatus = 'planned' | 'quoted' | 'ordered' | 'in-transit' | 'delivered' | 'delayed'

export interface InteriorProcurement {
  id: string
  projectId: string
  item: string
  category: ProductCategory
  vendor: string
  amount: number
  expectedDate: string
  status: ProcurementStatus
}

export type DecisionStatus = 'pending' | 'approved' | 'changes-requested'

export interface InteriorDecision {
  id: string
  projectId: string
  title: string
  requestedFrom: string
  dueDate: string
  status: DecisionStatus
}

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Furniture', 'Lighting', 'Decor', 'Flooring', 'Wall', 'Kitchen', 'Bedroom']

export const STYLE_OPTIONS: DesignStyle[] = ['Modern', 'Minimal', 'Luxury', 'Scandinavian', 'Traditional', 'Industrial', 'Contemporary']

export const COLOR_OPTIONS: DesignColor[] = ['White', 'Beige', 'Grey', 'Wood', 'Blue', 'Green', 'Custom']

export const ROOM_TYPES: RoomType[] = ['Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Study', 'Other']

export const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'House', 'Office', 'Commercial', 'Other']
