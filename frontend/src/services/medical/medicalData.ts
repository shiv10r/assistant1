// VSR Health — demo fixtures. Clinical and billing values are presentation-only;
// in production the backend is authoritative for every medical and financial record.

export type MedicalDepartment = 'Cardiology' | 'Dermatology' | 'Orthopedics' | 'Pediatrics' | 'General Medicine' | 'Neurology' | 'ENT' | 'Gynecology'

export type MedicalDoctor = {
  id: string
  name: string
  specialty: MedicalDepartment
  experienceYears: number
  facility: string
  languages: string
  consultationType: 'In-clinic' | 'Video' | 'Both'
  nextAvailable: string
  image: string
}

export const MEDICAL_DOCTORS: MedicalDoctor[] = [
  { id: 'doc-001', name: 'Dr. Ananya Rao', specialty: 'Cardiology', experienceYears: 14, facility: 'VSR Heart Institute', languages: 'English, Hindi, Kannada', consultationType: 'Both', nextAvailable: 'Today 4:30 PM', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-002', name: 'Dr. Vikram Malhotra', specialty: 'Dermatology', experienceYears: 9, facility: 'VSR Skin & Care Clinic', languages: 'English, Hindi', consultationType: 'In-clinic', nextAvailable: 'Tomorrow 10:00 AM', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-003', name: 'Dr. Sanya Kapoor', specialty: 'Orthopedics', experienceYears: 12, facility: 'VSR Bone & Joint Center', languages: 'English, Punjabi', consultationType: 'Both', nextAvailable: 'Today 6:00 PM', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-004', name: 'Dr. Rohan Desai', specialty: 'Pediatrics', experienceYears: 16, facility: 'VSR Children Hospital', languages: 'English, Marathi', consultationType: 'In-clinic', nextAvailable: 'Tomorrow 9:30 AM', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-005', name: 'Dr. Meera Krishnan', specialty: 'Neurology', experienceYears: 11, facility: 'VSR Neuro Center', languages: 'English, Tamil', consultationType: 'Video', nextAvailable: 'Fri 11:00 AM', image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-006', name: 'Dr. Arjun Nair', specialty: 'ENT', experienceYears: 8, facility: 'VSR ENT & Allergy Clinic', languages: 'English, Malayalam', consultationType: 'Both', nextAvailable: 'Today 5:00 PM', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-007', name: 'Dr. Kavita Iyer', specialty: 'Gynecology', experienceYears: 18, facility: 'VSR Women Care Center', languages: 'English, Hindi, Tamil', consultationType: 'In-clinic', nextAvailable: 'Tomorrow 2:00 PM', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300&q=82' },
  { id: 'doc-008', name: 'Dr. Kabir Malhotra', specialty: 'General Medicine', experienceYears: 20, facility: 'VSR Family Clinic', languages: 'English, Hindi, Punjabi', consultationType: 'Both', nextAvailable: 'Today 3:00 PM', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&h=300&q=82' },
]

export type MedicalPatient = {
  id: string
  mrn: string
  name: string
  dob: string
  sex: 'Male' | 'Female' | 'Other'
  phone: string
  email: string
  status: 'active' | 'inactive'
  allergies: readonly string[]
  chronicConditions: readonly string[]
  bloodGroup: string
}

export const MEDICAL_PATIENTS: MedicalPatient[] = [
  { id: 'pat-001', mrn: 'MRN-10421', name: 'Aarav Sharma', dob: '1988-04-12', sex: 'Male', phone: '98450 22190', email: 'aarav.sharma@example.com', status: 'active', allergies: ['Penicillin', 'Peanuts'], chronicConditions: ['Hypertension'], bloodGroup: 'B+' },
  { id: 'pat-002', mrn: 'MRN-10422', name: 'Meera Krishnan', dob: '1995-09-03', sex: 'Female', phone: '91234 56780', email: 'meera.k@example.com', status: 'active', allergies: [], chronicConditions: ['Asthma'], bloodGroup: 'O+' },
  { id: 'pat-003', mrn: 'MRN-10423', name: 'Kabir Malhotra', dob: '1979-12-27', sex: 'Male', phone: '98888 12345', email: 'kabir.m@example.com', status: 'active', allergies: ['Sulfa drugs'], chronicConditions: ['Type 2 Diabetes', 'Hypertension'], bloodGroup: 'A+' },
  { id: 'pat-004', mrn: 'MRN-10424', name: 'Sanya Kapoor', dob: '2001-06-19', sex: 'Female', phone: '97777 54321', email: 'sanya.k@example.com', status: 'active', allergies: [], chronicConditions: [], bloodGroup: 'AB+' },
  { id: 'pat-005', mrn: 'MRN-10425', name: 'Rohan Desai', dob: '1965-02-08', sex: 'Male', phone: '96666 77889', email: 'rohan.d@example.com', status: 'inactive', allergies: ['Latex'], chronicConditions: ['COPD'], bloodGroup: 'O-' },
]

export type MedicalAppointmentStatus = 'Requested' | 'Confirmed' | 'CheckedIn' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow' | 'Rescheduled'

export type MedicalAppointment = {
  id: string
  patientId: string
  doctorId: string
  type: 'In-clinic' | 'Video'
  startAt: string
  reason: string
  status: MedicalAppointmentStatus
  facility: string
}

export const MEDICAL_APPOINTMENTS: MedicalAppointment[] = [
  { id: 'apt-001', patientId: 'pat-001', doctorId: 'doc-008', type: 'In-clinic', startAt: '2026-08-16T10:30:00', reason: 'Blood pressure review', status: 'CheckedIn', facility: 'VSR Family Clinic' },
  { id: 'apt-002', patientId: 'pat-002', doctorId: 'doc-005', type: 'Video', startAt: '2026-08-16T11:00:00', reason: 'Migraine follow-up', status: 'Confirmed', facility: 'VSR Neuro Center' },
  { id: 'apt-003', patientId: 'pat-003', doctorId: 'doc-001', type: 'In-clinic', startAt: '2026-08-16T14:00:00', reason: 'ECG + cardiology consult', status: 'Confirmed', facility: 'VSR Heart Institute' },
  { id: 'apt-004', patientId: 'pat-004', doctorId: 'doc-002', type: 'In-clinic', startAt: '2026-08-17T10:00:00', reason: 'Acne treatment review', status: 'Requested', facility: 'VSR Skin & Care Clinic' },
  { id: 'apt-005', patientId: 'pat-001', doctorId: 'doc-001', type: 'In-clinic', startAt: '2026-08-05T09:30:00', reason: 'Chest discomfort', status: 'Completed', facility: 'VSR Heart Institute' },
  { id: 'apt-006', patientId: 'pat-002', doctorId: 'doc-008', type: 'Video', startAt: '2026-08-03T16:00:00', reason: 'Asthma review', status: 'Completed', facility: 'VSR Family Clinic' },
  { id: 'apt-007', patientId: 'pat-005', doctorId: 'doc-004', type: 'In-clinic', startAt: '2026-08-10T09:00:00', reason: 'Chronic cough', status: 'NoShow', facility: 'VSR Children Hospital' },
]

export type MedicalVitals = {
  temperature: string
  pulse: string
  respiratoryRate: string
  bloodPressure: string
  spo2: string
  weight: string
  height: string
  bmi: string
}

export type MedicalEncounter = {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  startedAt: string
  chiefComplaint: string
  assessment: string
  plan: string
  vitals: MedicalVitals
  status: 'open' | 'closed'
}

export const MEDICAL_ENCOUNTERS: MedicalEncounter[] = [
  {
    id: 'enc-001',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    appointmentId: 'apt-005',
    startedAt: '2026-08-05T09:35:00',
    chiefComplaint: 'Intermittent chest discomfort and shortness of breath on exertion for 2 weeks.',
    assessment: 'Hypertension under review. ECG shows mild sinus tachycardia. No acute ischemic changes.',
    plan: 'Continue antihypertensives. Add low-dose statin. Repeat lipid panel in 6 weeks. Cardiac stress test if symptoms persist.',
    vitals: { temperature: '98.4 °F', pulse: '92 bpm', respiratoryRate: '18/min', bloodPressure: '148/92 mmHg', spo2: '97%', weight: '82 kg', height: '176 cm', bmi: '26.5' },
    status: 'closed',
  },
  {
    id: 'enc-002',
    patientId: 'pat-002',
    doctorId: 'doc-005',
    appointmentId: 'apt-002',
    startedAt: '2026-08-16T11:05:00',
    chiefComplaint: 'Recurring migraine with aura, 2-3 episodes per month.',
    assessment: 'Migraine without complication. Current prophylaxis not fully effective.',
    plan: 'Increase topiramate dose. Start B12 + magnesium supplement. Trigger diary for 4 weeks, then review.',
    vitals: { temperature: '98.6 °F', pulse: '76 bpm', respiratoryRate: '16/min', bloodPressure: '118/76 mmHg', spo2: '98%', weight: '61 kg', height: '164 cm', bmi: '22.7' },
    status: 'open',
  },
]

export type MedicalPrescriptionItem = {
  medication: string
  dose: string
  route: string
  frequency: string
  duration: string
  instructions: string
}

export type MedicalPrescription = {
  id: string
  patientId: string
  doctorId: string
  createdAt: string
  status: 'active' | 'completed' | 'cancelled'
  items: readonly MedicalPrescriptionItem[]
}

export const MEDICAL_PRESCRIPTIONS: MedicalPrescription[] = [
  {
    id: 'rx-001',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    createdAt: '2026-08-05',
    status: 'active',
    items: [
      { medication: 'Amlodipine 5 mg', dose: '5 mg', route: 'Oral', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning after breakfast.' },
      { medication: 'Atorvastatin 10 mg', dose: '10 mg', route: 'Oral', frequency: 'Once at night', duration: '90 days', instructions: 'Take at bedtime. Avoid grapefruit juice.' },
    ],
  },
  {
    id: 'rx-002',
    patientId: 'pat-002',
    doctorId: 'doc-005',
    createdAt: '2026-08-16',
    status: 'active',
    items: [
      { medication: 'Topiramate 50 mg', dose: '50 mg', route: 'Oral', frequency: 'Twice daily', duration: '60 days', instructions: 'Increase from 25 mg after one week. Drink plenty of water.' },
      { medication: 'Vitamin B12 500 mcg', dose: '500 mcg', route: 'Oral', frequency: 'Once daily', duration: '90 days', instructions: 'With or without food.' },
    ],
  },
  {
    id: 'rx-003',
    patientId: 'pat-003',
    doctorId: 'doc-008',
    createdAt: '2026-07-12',
    status: 'completed',
    items: [
      { medication: 'Metformin 500 mg', dose: '500 mg', route: 'Oral', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals to reduce GI upset.' },
    ],
  },
]

export type MedicalLabStatus = 'Ordered' | 'Collected' | 'Processing' | 'Completed' | 'Cancelled'

export type MedicalLabResult = {
  id: string
  patientId: string
  test: string
  result?: string
  unit?: string
  referenceRange?: string
  flag?: 'normal' | 'high' | 'low'
  status: MedicalLabStatus
  orderedAt: string
  verifiedAt?: string
}

export const MEDICAL_LABS: MedicalLabResult[] = [
  { id: 'lab-001', patientId: 'pat-001', test: 'Lipid Profile', result: 'Total 214 mg/dL', unit: 'mg/dL', referenceRange: '<200', flag: 'high', status: 'Completed', orderedAt: '2026-08-05', verifiedAt: '2026-08-06' },
  { id: 'lab-002', patientId: 'pat-001', test: 'HbA1c', result: '5.6 %', unit: '%', referenceRange: '4.0-5.6', flag: 'normal', status: 'Completed', orderedAt: '2026-08-05', verifiedAt: '2026-08-06' },
  { id: 'lab-003', patientId: 'pat-002', test: 'Vitamin D (25-OH)', result: '18 ng/mL', unit: 'ng/mL', referenceRange: '30-100', flag: 'low', status: 'Processing', orderedAt: '2026-08-16' },
  { id: 'lab-004', patientId: 'pat-003', test: 'ECG Report', status: 'Ordered', orderedAt: '2026-08-16' },
  { id: 'lab-005', patientId: 'pat-005', test: 'Chest X-Ray', status: 'Cancelled', orderedAt: '2026-08-10' },
]

export type MedicalInvoiceStatus = 'draft' | 'due' | 'paid' | 'overdue'

export type MedicalInvoiceItem = {
  description: string
  amount: number
}

export type MedicalInvoice = {
  id: string
  patientId: string
  issuedAt: string
  status: MedicalInvoiceStatus
  items: readonly MedicalInvoiceItem[]
  tax: number
  discount: number
}

export const MEDICAL_INVOICES: MedicalInvoice[] = [
  {
    id: 'inv-001',
    patientId: 'pat-001',
    issuedAt: '2026-08-05',
    status: 'paid',
    items: [
      { description: 'Cardiology consultation', amount: 900 },
      { description: 'ECG', amount: 400 },
      { description: 'Lipid profile (lab)', amount: 550 },
    ],
    tax: 92,
    discount: 0,
  },
  {
    id: 'inv-002',
    patientId: 'pat-002',
    issuedAt: '2026-08-16',
    status: 'due',
    items: [
      { description: 'Neurology video consultation', amount: 1200 },
      { description: 'Vitamin D test (lab)', amount: 480 },
    ],
    tax: 84,
    discount: 0,
  },
  {
    id: 'inv-003',
    patientId: 'pat-003',
    issuedAt: '2026-08-01',
    status: 'overdue',
    items: [
      { description: 'Cardiology consultation', amount: 900 },
      { description: 'ECG', amount: 400 },
      { description: 'Medication dispense (30 days)', amount: 720 },
    ],
    tax: 101,
    discount: 50,
  },
]

export const MEDICAL_NOTIFICATIONS = [
  { id: 'med-ntf-001', type: 'appointment' as const, title: 'Appointment confirmed', body: 'Your cardiology consult with Dr. Ananya Rao is confirmed for 16 Aug, 2:00 PM at VSR Heart Institute.', at: '2026-08-14T10:00:00', read: false },
  { id: 'med-ntf-002', type: 'lab' as const, title: 'Lab result available', body: 'Your HbA1c result (5.6 %) is ready to view.', at: '2026-08-06T08:30:00', read: false },
  { id: 'med-ntf-003', type: 'bill' as const, title: 'Bill generated', body: 'Invoice INV-002 for ₹1,764 is due. Pay via the billing tab.', at: '2026-08-16T12:10:00', read: false },
  { id: 'med-ntf-004', type: 'prescription' as const, title: 'Prescription ready', body: 'Dr. Meera Krishnan issued a new prescription for you.', at: '2026-08-16T11:20:00', read: true },
] as const

export const MEDICAL_AUDIT_LOGS = [
  { id: 'med-aud-001', actor: 'dr.ananya', action: 'Encounter created', resource: 'Encounter ENC-001 (pat-001)', at: '2026-08-05T09:35:00', outcome: 'success' as const },
  { id: 'med-aud-002', actor: 'dr.meera', action: 'Prescription created', resource: 'Prescription RX-002 (pat-002)', at: '2026-08-16T11:20:00', outcome: 'success' as const },
  { id: 'med-aud-003', actor: 'reception.sahil', action: 'Patient checked in', resource: 'Appointment APT-001', at: '2026-08-16T10:25:00', outcome: 'success' as const },
  { id: 'med-aud-004', actor: 'system', action: 'Emergency access used', resource: 'Patient record pat-005', at: '2026-08-12T03:14:00', outcome: 'warning' as const },
  { id: 'med-aud-005', actor: 'billing.priya', action: 'Invoice adjusted', resource: 'Invoice INV-003', at: '2026-08-02T15:00:00', outcome: 'success' as const },
] as const

export const MEDICAL_ADMIN_STATS = {
  appointmentsToday: 48,
  patientsToday: 132,
  doctorsOnDuty: 17,
  pendingLabResults: 9,
  pendingBills: 23,
  pharmacyLowStock: 6,
  cancelledAppointments: 4,
  noShows: 3,
} as const

// ---- helpers ---------------------------------------------------------------

export function medicalDoctorById(id: string | undefined): MedicalDoctor | null {
  return MEDICAL_DOCTORS.find((doctor) => doctor.id === id) ?? null
}

export function medicalPatientById(id: string | undefined): MedicalPatient | null {
  return MEDICAL_PATIENTS.find((patient) => patient.id === id) ?? null
}

export function medicalAppointmentsFor(patientId: string): MedicalAppointment[] {
  return MEDICAL_APPOINTMENTS.filter((appointment) => appointment.patientId === patientId)
}

export function medicalPrescriptionsFor(patientId: string): MedicalPrescription[] {
  return MEDICAL_PRESCRIPTIONS.filter((prescription) => prescription.patientId === patientId)
}

export function medicalLabsFor(patientId: string): MedicalLabResult[] {
  return MEDICAL_LABS.filter((lab) => lab.patientId === patientId)
}

export function medicalInvoicesFor(patientId: string): MedicalInvoice[] {
  return MEDICAL_INVOICES.filter((invoice) => invoice.patientId === patientId)
}

export function medicalEncounterFor(patientId: string): MedicalEncounter | null {
  return MEDICAL_ENCOUNTERS.find((encounter) => encounter.patientId === patientId) ?? null
}

export function medicalInvoiceTotal(invoice: MedicalInvoice): number {
  const subtotal = invoice.items.reduce((total, item) => total + item.amount, 0)
  return subtotal - invoice.discount + invoice.tax
}

export function medicalFormatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function medicalFormatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function medicalFormatDateTime(iso: string): string {
  return `${medicalFormatDate(iso)} · ${medicalFormatTime(iso)}`
}