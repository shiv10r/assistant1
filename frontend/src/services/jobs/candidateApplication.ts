export type CandidateProfile = {
  readonly fullName: string
  readonly email: string
  readonly phone: string
  readonly location: string
  readonly headline: string
  readonly experienceSummary: string
  readonly skills: readonly string[]
}

export type CandidateProfileErrors = Partial<Record<keyof CandidateProfile, string>>

export type ResumeMetadata = {
  readonly name: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly selectedAt: string
}

export type ResumeInput = {
  readonly name: string
  readonly type: string
  readonly size: number
}

export type ScreeningAnswer = {
  readonly questionId: string
  readonly value: string
}

export type ApplicationDraft = {
  readonly jobSlug: string
  readonly answers: readonly ScreeningAnswer[]
  readonly updatedAt: string
}

export type CandidateApplication = {
  readonly id: string
  readonly jobSlug: string
  readonly company: string
  readonly appliedDate: string
  readonly status: 'Submitted'
  readonly nextStep: string
  readonly profile: CandidateProfile
  readonly resume: ResumeMetadata
  readonly answers: readonly ScreeningAnswer[]
}

export type CandidateState = {
  readonly version: 1
  readonly profile: CandidateProfile | null
  readonly resume: ResumeMetadata | null
  readonly drafts: readonly ApplicationDraft[]
  readonly applications: readonly CandidateApplication[]
}

export type ResumeValidationResult =
  | { readonly kind: 'valid'; readonly resume: ResumeMetadata }
  | { readonly kind: 'invalid'; readonly message: string }

export type SubmitApplicationInput = {
  readonly applicationId: string
  readonly jobSlug: string
  readonly company: string
  readonly appliedDate: string
  readonly profile: CandidateProfile
  readonly resume: ResumeMetadata
  readonly answers: readonly ScreeningAnswer[]
}

export type SubmitApplicationResult =
  | { readonly kind: 'submitted'; readonly state: CandidateState; readonly application: CandidateApplication }
  | { readonly kind: 'duplicate'; readonly applicationId: string }

export const MAX_RESUME_SIZE_BYTES = 5_000_000

export const EMPTY_CANDIDATE_PROFILE: CandidateProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  experienceSummary: '',
  skills: [],
}

export const EMPTY_CANDIDATE_STATE: CandidateState = {
  version: 1,
  profile: null,
  resume: null,
  drafts: [],
  applications: [],
}

const ACCEPTED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ACCEPTED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const

export function normalizeSkills(values: readonly string[]): readonly string[] {
  const normalized: string[] = []
  const seen = new Set<string>()
  for (const value of values) {
    const skill = value.trim()
    const key = skill.toLocaleLowerCase()
    if (!skill || seen.has(key)) continue
    seen.add(key)
    normalized.push(skill)
  }
  return normalized
}

export function validateCandidateProfile(profile: CandidateProfile): CandidateProfileErrors {
  return {
    ...(!profile.fullName.trim() ? { fullName: 'Enter your full name.' } : {}),
    ...(!profile.email.trim() ? { email: 'Enter your email address.' } : {}),
    ...(!profile.phone.trim() ? { phone: 'Enter your phone number.' } : {}),
    ...(!profile.location.trim() ? { location: 'Enter your location.' } : {}),
    ...(!profile.headline.trim() ? { headline: 'Enter your professional headline.' } : {}),
    ...(!profile.experienceSummary.trim() ? { experienceSummary: 'Summarize your experience.' } : {}),
    ...(normalizeSkills(profile.skills).length === 0 ? { skills: 'Add at least one skill.' } : {}),
  }
}

export function validateResume(input: ResumeInput, selectedAt: string): ResumeValidationResult {
  const name = input.name.trim()
  const lowerName = name.toLocaleLowerCase()
  const acceptedExtension = ACCEPTED_RESUME_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  if (!acceptedExtension && !ACCEPTED_RESUME_TYPES.has(input.type)) {
    return { kind: 'invalid', message: 'Choose a PDF, DOC or DOCX resume.' }
  }
  if (input.size > MAX_RESUME_SIZE_BYTES) {
    return { kind: 'invalid', message: 'Resume must be 5 MB or smaller.' }
  }
  return {
    kind: 'valid',
    resume: { name, mimeType: input.type, sizeBytes: input.size, selectedAt },
  }
}

export function submitApplication(state: CandidateState, input: SubmitApplicationInput): SubmitApplicationResult {
  const existing = state.applications.find((application) => application.jobSlug === input.jobSlug)
  if (existing) return { kind: 'duplicate', applicationId: existing.id }

  const application: CandidateApplication = {
    id: input.applicationId,
    jobSlug: input.jobSlug,
    company: input.company,
    appliedDate: input.appliedDate,
    status: 'Submitted',
    nextStep: 'Profile and resume submitted',
    profile: input.profile,
    resume: input.resume,
    answers: input.answers,
  }
  return {
    kind: 'submitted',
    application,
    state: {
      ...state,
      profile: input.profile,
      resume: input.resume,
      drafts: state.drafts.filter((draft) => draft.jobSlug !== input.jobSlug),
      applications: [application, ...state.applications],
    },
  }
}
