// ── Interior Design service entities ───────────────────────────────────────

export type PropertyType = 'Apartment' | 'Villa' | 'House' | 'Office' | 'Commercial' | 'Other'

export type RoomType = 'Living Room' | 'Master Bedroom' | 'Kitchen' | 'Bathroom' | 'Dining Room' | 'Study' | 'Other'

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface InteriorProject {
  id: string
  name: string
  propertyType: PropertyType
  location: string
  totalArea: number // sq ft
  budget: number
  status: ProjectStatus
  createdAt: string
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

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Furniture', 'Lighting', 'Decor', 'Flooring', 'Wall', 'Kitchen', 'Bedroom']

export const STYLE_OPTIONS: DesignStyle[] = ['Modern', 'Minimal', 'Luxury', 'Scandinavian', 'Traditional', 'Industrial', 'Contemporary']

export const COLOR_OPTIONS: DesignColor[] = ['White', 'Beige', 'Grey', 'Wood', 'Blue', 'Green', 'Custom']

export const ROOM_TYPES: RoomType[] = ['Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Study', 'Other']

export const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'House', 'Office', 'Commercial', 'Other']