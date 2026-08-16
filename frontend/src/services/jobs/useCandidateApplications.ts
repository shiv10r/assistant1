import { useState } from 'react'
import { submitApplication } from './candidateApplication'
import type {
  ApplicationDraft,
  CandidateProfile,
  CandidateState,
  ResumeMetadata,
  SubmitApplicationInput,
  SubmitApplicationResult,
} from './candidateApplication'
import {
  readCandidateState,
  saveApplicationDraft,
  saveCandidateProfile,
  saveCandidateResume,
  writeCandidateState,
} from './candidateStore'

type PersistResult = { readonly kind: 'saved' } | { readonly kind: 'storage-error' }
type SubmitResult = SubmitApplicationResult | { readonly kind: 'storage-error' }

export function useCandidateApplications() {
  const [state, setState] = useState<CandidateState>(() => readCandidateState(localStorage))
  const [persistenceError, setPersistenceError] = useState<string | null>(null)

  function persist(next: CandidateState): PersistResult {
    try {
      writeCandidateState(localStorage, next)
      setState(next)
      setPersistenceError(null)
      return { kind: 'saved' }
    } catch (error) {
      if (error instanceof DOMException) {
        setPersistenceError('This browser could not save your Jobs progress. Keep this page open and try again.')
        return { kind: 'storage-error' }
      }
      throw error
    }
  }

  function saveProfile(profile: CandidateProfile): PersistResult {
    return persist(saveCandidateProfile(state, profile))
  }

  function saveResume(resume: ResumeMetadata): PersistResult {
    return persist(saveCandidateResume(state, resume))
  }

  function saveDraft(draft: ApplicationDraft): PersistResult {
    return persist(saveApplicationDraft(state, draft))
  }

  function submit(input: SubmitApplicationInput): SubmitResult {
    const result = submitApplication(state, input)
    if (result.kind === 'duplicate') return result
    const persisted = persist(result.state)
    return persisted.kind === 'saved' ? result : persisted
  }

  return { state, persistenceError, saveProfile, saveResume, saveDraft, submit }
}
