import type { ModuleKey } from '../../app/moduleRegistry'

export interface OperationsConfig {
  id: ModuleKey
  title: string
  description: string
  item: string
  items: string
  customer: string
  location: string
  visit: string
  people: string
  value: string
  attendance: boolean
  map: boolean
  aiPrompts: string[]
  seeds: Array<{ title: string; customer: string; location: string; status: string; progress: number; value: number; owner: string; lat: number; lng: number }>
  team: Array<{ name: string; role: string; dailyRate?: number }>
}

const configs: OperationsConfig[] = [
  {
    id: 'interior', title: 'Studio operations', description: 'Control design delivery, site coordination, approvals and project knowledge.', item: 'project', items: 'projects', customer: 'client', location: 'site', visit: 'site visit', people: 'studio team', value: 'design value', attendance: true, map: true,
    aiPrompts: ['Summarize delivery risk', 'Draft a client update', 'Identify delayed approvals'],
    seeds: [
      { title: 'Aster Residence', customer: 'Mehta Family', location: 'Bandra West, Mumbai', status: 'Active', progress: 68, value: 4800000, owner: 'Anika Shah', lat: 19.0607, lng: 72.8362 },
      { title: 'Northstar Workplace', customer: 'Northstar Labs', location: 'Koramangala, Bengaluru', status: 'Review', progress: 42, value: 7200000, owner: 'Rohan Mehta', lat: 12.9352, lng: 77.6245 },
      { title: 'Vale Boutique', customer: 'Vale Retail', location: 'Hauz Khas, Delhi', status: 'Planning', progress: 18, value: 3100000, owner: 'Maya Rao', lat: 28.5494, lng: 77.2001 },
    ], team: [{ name: 'Anika Shah', role: 'Design lead', dailyRate: 4500 }, { name: 'Rohan Mehta', role: 'Site coordinator', dailyRate: 3200 }, { name: 'Maya Rao', role: 'Interior architect', dailyRate: 3800 }],
  },
  {
    id: 'warehouse', title: 'Network operations', description: 'Coordinate facilities, inventory programs, field work and fulfillment readiness.', item: 'initiative', items: 'initiatives', customer: 'account', location: 'facility', visit: 'facility visit', people: 'operations team', value: 'program value', attendance: true, map: true,
    aiPrompts: ['Find fulfillment bottlenecks', 'Prepare a stock-risk brief', 'Suggest today’s facility priorities'],
    seeds: [
      { title: 'West Hub Expansion', customer: 'National Network', location: 'Bhiwandi, Maharashtra', status: 'Active', progress: 74, value: 12500000, owner: 'Karan Patel', lat: 19.2967, lng: 73.0631 },
      { title: 'Cold Chain Rollout', customer: 'FreshRoute', location: 'Hyderabad, Telangana', status: 'Review', progress: 51, value: 8900000, owner: 'Isha Verma', lat: 17.385, lng: 78.4867 },
      { title: 'Cycle Count Program', customer: 'Central Operations', location: 'Pune, Maharashtra', status: 'Planning', progress: 24, value: 1800000, owner: 'Dev Nair', lat: 18.5204, lng: 73.8567 },
    ], team: [{ name: 'Karan Patel', role: 'Facility manager', dailyRate: 2800 }, { name: 'Isha Verma', role: 'Inventory lead', dailyRate: 2500 }, { name: 'Dev Nair', role: 'Dispatch supervisor', dailyRate: 2300 }],
  },
  {
    id: 'school', title: 'Campus operations', description: 'Track institutional priorities, campus visits, staff presence and shared records.', item: 'initiative', items: 'initiatives', customer: 'department', location: 'campus', visit: 'campus visit', people: 'staff', value: 'allocated budget', attendance: true, map: true,
    aiPrompts: ['Summarize campus priorities', 'Draft a parent communication', 'Highlight attendance concerns'],
    seeds: [
      { title: 'STEM Lab Modernization', customer: 'Academic Council', location: 'Main Campus, Jaipur', status: 'Active', progress: 63, value: 2400000, owner: 'Neha Joshi', lat: 26.9124, lng: 75.7873 },
      { title: 'Admissions 2027', customer: 'Admissions Office', location: 'City Campus, Jaipur', status: 'Review', progress: 46, value: 850000, owner: 'Aman Sethi', lat: 26.892, lng: 75.81 },
      { title: 'Sports Ground Upgrade', customer: 'Student Affairs', location: 'North Campus, Jaipur', status: 'Planning', progress: 15, value: 1700000, owner: 'Riya Sen', lat: 26.95, lng: 75.78 },
    ], team: [{ name: 'Neha Joshi', role: 'Academic coordinator', dailyRate: 2200 }, { name: 'Aman Sethi', role: 'Administrator', dailyRate: 2100 }, { name: 'Riya Sen', role: 'Activities lead', dailyRate: 1900 }],
  },
  {
    id: 'hotel', title: 'Stay planner', description: 'Keep reservations, property visits and travel documents organized in one private hub.', item: 'stay plan', items: 'stay plans', customer: 'traveler', location: 'property', visit: 'property check-in', people: 'travelers', value: 'trip value', attendance: false, map: true,
    aiPrompts: ['Build my arrival checklist', 'Compare my stay options', 'Suggest a local itinerary'],
    seeds: [
      { title: 'Mumbai Design Week', customer: 'Personal trip', location: 'Colaba, Mumbai', status: 'Confirmed', progress: 78, value: 94000, owner: 'You', lat: 18.9067, lng: 72.8147 },
      { title: 'Goa Weekend', customer: 'Family trip', location: 'Assagao, Goa', status: 'Planning', progress: 34, value: 67000, owner: 'You', lat: 15.599, lng: 73.819 },
      { title: 'Delhi Conference', customer: 'Business travel', location: 'Aerocity, Delhi', status: 'Review', progress: 52, value: 48000, owner: 'You', lat: 28.5562, lng: 77.1 },
    ], team: [],
  },
  {
    id: 'travel', title: 'Journey workspace', description: 'Plan itineraries, transfers, check-ins and trip files across every destination.', item: 'journey', items: 'journeys', customer: 'travel party', location: 'destination', visit: 'travel check-in', people: 'travelers', value: 'trip budget', attendance: false, map: true,
    aiPrompts: ['Optimize my itinerary', 'Create a packing brief', 'Find gaps in my trip plan'],
    seeds: [
      { title: 'Japan Spring Route', customer: 'Friends group', location: 'Tokyo, Japan', status: 'Planning', progress: 44, value: 420000, owner: 'You', lat: 35.6762, lng: 139.6503 },
      { title: 'Kerala Slow Travel', customer: 'Family', location: 'Kochi, Kerala', status: 'Confirmed', progress: 71, value: 185000, owner: 'You', lat: 9.9312, lng: 76.2673 },
      { title: 'Lisbon Work Week', customer: 'Solo', location: 'Lisbon, Portugal', status: 'Review', progress: 26, value: 235000, owner: 'You', lat: 38.7223, lng: -9.1393 },
    ], team: [],
  },
  {
    id: 'news', title: 'Editorial operations', description: 'Coordinate coverage plans, field assignments, publishing readiness and source files.', item: 'coverage plan', items: 'coverage plans', customer: 'desk', location: 'reporting area', visit: 'field assignment', people: 'newsroom team', value: 'coverage budget', attendance: true, map: true,
    aiPrompts: ['Draft an editorial briefing', 'Identify coverage gaps', 'Summarize field assignments'],
    seeds: [
      { title: 'National Budget Desk', customer: 'Business', location: 'New Delhi', status: 'Active', progress: 72, value: 450000, owner: 'Aarav Jain', lat: 28.6139, lng: 77.209 },
      { title: 'Monsoon Impact Series', customer: 'Climate', location: 'Konkan Coast', status: 'Planning', progress: 31, value: 320000, owner: 'Sara Ali', lat: 16.9902, lng: 73.312 },
      { title: 'Startup India Report', customer: 'Technology', location: 'Bengaluru', status: 'Review', progress: 56, value: 280000, owner: 'Kabir Das', lat: 12.9716, lng: 77.5946 },
    ], team: [{ name: 'Aarav Jain', role: 'Desk editor', dailyRate: 2800 }, { name: 'Sara Ali', role: 'Field reporter', dailyRate: 2400 }, { name: 'Kabir Das', role: 'Producer', dailyRate: 2600 }],
  },
  {
    id: 'jobs', title: 'Career command center', description: 'Manage target roles, interviews, employer touchpoints and application documents.', item: 'job target', items: 'job targets', customer: 'employer', location: 'work location', visit: 'interview', people: 'contacts', value: 'target package', attendance: false, map: true,
    aiPrompts: ['Prioritize my applications', 'Prepare interview questions', 'Draft a follow-up message'],
    seeds: [
      { title: 'Senior Product Designer', customer: 'Nova Systems', location: 'Bengaluru', status: 'Interview', progress: 72, value: 3200000, owner: 'You', lat: 12.9716, lng: 77.5946 },
      { title: 'Design Operations Lead', customer: 'Atlas Group', location: 'Gurugram', status: 'Applied', progress: 38, value: 3600000, owner: 'You', lat: 28.4595, lng: 77.0266 },
      { title: 'Principal UX Designer', customer: 'Orbit Labs', location: 'Remote', status: 'Saved', progress: 16, value: 4000000, owner: 'You', lat: 19.076, lng: 72.8777 },
    ], team: [],
  },
  {
    id: 'commerce', title: 'Purchase workspace', description: 'Organize major purchases, deliveries, seller touchpoints and product documents.', item: 'purchase plan', items: 'purchase plans', customer: 'seller', location: 'delivery area', visit: 'delivery event', people: 'recipients', value: 'order value', attendance: false, map: true,
    aiPrompts: ['Compare planned purchases', 'Flag delivery risks', 'Build a reorder shortlist'],
    seeds: [
      { title: 'Home Office Refresh', customer: 'Multiple sellers', location: 'Mumbai', status: 'Active', progress: 66, value: 185000, owner: 'You', lat: 19.076, lng: 72.8777 },
      { title: 'Kitchen Appliance Set', customer: 'Croma', location: 'Pune', status: 'Review', progress: 48, value: 124000, owner: 'You', lat: 18.5204, lng: 73.8567 },
      { title: 'Festival Gifts', customer: 'Marketplace', location: 'Ahmedabad', status: 'Planning', progress: 22, value: 76000, owner: 'You', lat: 23.0225, lng: 72.5714 },
    ], team: [],
  },
  {
    id: 'bank', title: 'Financial planning', description: 'Track financial goals, advisor appointments, branch access and protected documents.', item: 'financial goal', items: 'financial goals', customer: 'account', location: 'service location', visit: 'advisor appointment', people: 'beneficiaries', value: 'target value', attendance: false, map: true,
    aiPrompts: ['Summarize my goal progress', 'Create an advisor question list', 'Explain upcoming financial actions'],
    seeds: [
      { title: 'Emergency Reserve', customer: 'Savings', location: 'Digital account', status: 'Active', progress: 68, value: 600000, owner: 'You', lat: 19.076, lng: 72.8777 },
      { title: 'Home Purchase Fund', customer: 'Investment account', location: 'Mumbai', status: 'Planning', progress: 37, value: 4500000, owner: 'You', lat: 19.1136, lng: 72.8697 },
      { title: 'Education Portfolio', customer: 'Managed investments', location: 'Bengaluru', status: 'Review', progress: 54, value: 1800000, owner: 'You', lat: 12.9716, lng: 77.5946 },
    ], team: [],
  },
  {
    id: 'medical', title: 'Care coordination', description: 'Coordinate care plans, appointments, provider locations and health documents.', item: 'care plan', items: 'care plans', customer: 'provider', location: 'care location', visit: 'appointment', people: 'care team', value: 'care estimate', attendance: false, map: true,
    aiPrompts: ['Prepare my next appointment', 'Summarize my care timeline', 'Create a medication question list'],
    seeds: [
      { title: 'Annual Wellness Plan', customer: 'City Medical Centre', location: 'Bandra, Mumbai', status: 'Active', progress: 62, value: 35000, owner: 'You', lat: 19.0596, lng: 72.8295 },
      { title: 'Dental Care Program', customer: 'Smile Studio', location: 'Andheri, Mumbai', status: 'Review', progress: 45, value: 58000, owner: 'You', lat: 19.1136, lng: 72.8697 },
      { title: 'Physiotherapy Recovery', customer: 'Motion Clinic', location: 'Powai, Mumbai', status: 'Planning', progress: 28, value: 42000, owner: 'You', lat: 19.1176, lng: 72.906 },
    ], team: [],
  },
  {
    id: 'home-services', title: 'Service operations', description: 'Manage active jobs, customer visits, professional availability and service records.', item: 'service job', items: 'service jobs', customer: 'customer', location: 'service site', visit: 'service visit', people: 'professionals', value: 'booking value', attendance: true, map: true,
    aiPrompts: ['Build today’s dispatch plan', 'Identify service delays', 'Draft a customer completion note'],
    seeds: [
      { title: 'Apartment Deep Clean', customer: 'Nisha Kapoor', location: 'Powai, Mumbai', status: 'Scheduled', progress: 35, value: 8500, owner: 'CleanCo Team', lat: 19.1176, lng: 72.906 },
      { title: 'AC Service Contract', customer: 'Arjun Malhotra', location: 'Gurugram', status: 'Active', progress: 64, value: 18000, owner: 'Ravi Kumar', lat: 28.4595, lng: 77.0266 },
      { title: 'Kitchen Plumbing', customer: 'Meera Shah', location: 'Ahmedabad', status: 'Review', progress: 82, value: 6200, owner: 'Imran Sheikh', lat: 23.0225, lng: 72.5714 },
    ], team: [{ name: 'Ravi Kumar', role: 'HVAC technician', dailyRate: 1800 }, { name: 'Imran Sheikh', role: 'Plumber', dailyRate: 1700 }, { name: 'CleanCo Team', role: 'Cleaning crew', dailyRate: 2400 }],
  },
]

export const OPERATIONS_CONFIG = Object.fromEntries(configs.map((config) => [config.id, config])) as Record<ModuleKey, OperationsConfig>

export function operationsConfig(id: string | undefined): OperationsConfig | null {
  return id && id in OPERATIONS_CONFIG ? OPERATIONS_CONFIG[id as ModuleKey] : null
}
