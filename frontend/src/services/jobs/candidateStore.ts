import { EMPTY_CANDIDATE_STATE } from './candidateApplication.ts'
import type {
  ApplicationDraft,
  CandidateApplication,
  CandidateProfile,
  CandidateState,
  ResumeMetadata,
  ScreeningAnswer,
} from './candidateApplication.ts'

export const CANDIDATE_STORAGE_KEY = 'vsr-jobs-candidate-v1'

export type CandidateStorage = {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
  readonly removeItem: (key: string) => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isCandidateProfile(value: unknown): value is CandidateProfile {
  if (!isRecord(value)) return false
  return typeof value.fullName === 'string'
    && typeof value.email === 'string'
    && typeof value.phone === 'string'
    && typeof value.location === 'string'
    && typeof value.headline === 'string'
    && typeof value.experienceSummary === 'string'
    && isStringArray(value.skills)
}

function isResumeMetadata(value: unknown): value is ResumeMetadata {
  if (!isRecord(value)) return false
  return typeof value.name === 'string'
    && typeof value.mimeType === 'string'
    && typeof value.sizeBytes === 'number'
    && typeof value.selectedAt === 'string'
}

function isScreeningAnswer(value: unknown): value is ScreeningAnswer {
  if (!isRecord(value)) return false
  return typeof value.questionId === 'string' && typeof value.value === 'string'
}

function isApplicationDraft(value: unknown): value is ApplicationDraft {
  if (!isRecord(value)) return false
  return typeof value.jobSlug === 'string'
    && typeof value.updatedAt === 'string'
    && Array.isArray(value.answers)
    && value.answers.every(isScreeningAnswer)
}

function isCandidateApplication(value: unknown): value is CandidateApplication {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && typeof value.jobSlug === 'string'
    && typeof value.company === 'string'
    && typeof value.appliedDate === 'string'
    && value.status === 'Submitted'
    && typeof value.nextStep === 'string'
    && isCandidateProfile(value.profile)
    && isResumeMetadata(value.resume)
    && Array.isArray(value.answers)
    && value.answers.every(isScreeningAnswer)
}

function isCandidateState(value: unknown): value is CandidateState {
  if (!isRecord(value) || value.version !== 1) return false
  const validProfile = value.profile === null || isCandidateProfile(value.profile)
  const validResume = value.resume === null || isResumeMetadata(value.resume)
  return validProfile
    && validResume
    && Array.isArray(value.drafts)
    && value.drafts.every(isApplicationDraft)
    && Array.isArray(value.applications)
    && value.applications.every(isCandidateApplication)
}

export function readCandidateState(storage: CandidateStorage): CandidateState {
  const raw = storage.getItem(CANDIDATE_STORAGE_KEY)
  if (!raw) return EMPTY_CANDIDATE_STATE
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isCandidateState(parsed)) return parsed
    storage.removeItem(CANDIDATE_STORAGE_KEY)
    return EMPTY_CANDIDATE_STATE
  } catch (error) {
    if (error instanceof SyntaxError) {
      storage.removeItem(CANDIDATE_STORAGE_KEY)
      return EMPTY_CANDIDATE_STATE
    }
    throw error
  }
}

export function writeCandidateState(storage: CandidateStorage, state: CandidateState): void {
  storage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(state))
}

export function saveCandidateProfile(state: CandidateState, profile: CandidateProfile): CandidateState {
  return { ...state, profile }
}

export function saveCandidateResume(state: CandidateState, resume: ResumeMetadata): CandidateState {
  return { ...state, resume }
}

export function saveApplicationDraft(state: CandidateState, draft: ApplicationDraft): CandidateState {
  return {
    ...state,
    drafts: [draft, ...state.drafts.filter((item) => item.jobSlug !== draft.jobSlug)],
  }
}

export function findApplicationDraft(state: CandidateState, jobSlug: string): ApplicationDraft | null {
  return state.drafts.find((draft) => draft.jobSlug === jobSlug) ?? null
}

export function findCandidateApplication(state: CandidateState, jobSlug: string): CandidateApplication | null {
  return state.applications.find((application) => application.jobSlug === jobSlug) ?? null
}
