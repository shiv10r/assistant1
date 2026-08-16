import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EMPTY_CANDIDATE_STATE,
  normalizeSkills,
  submitApplication,
  validateCandidateProfile,
  validateResume,
} from '../src/services/jobs/candidateApplication.ts'
import type { CandidateProfile } from '../src/services/jobs/candidateApplication.ts'

const COMPLETE_PROFILE: CandidateProfile = {
  fullName: 'Aarav Sharma',
  email: 'aarav@example.com',
  phone: '+91 98765 43210',
  location: 'Bengaluru',
  headline: 'Frontend engineer',
  experienceSummary: 'Four years building accessible React products.',
  skills: ['React', 'TypeScript'],
}

test('normalizes skills when entries contain blanks and duplicates', () => {
  const normalized = normalizeSkills([' React ', '', 'typescript', 'react'])

  assert.deepEqual(normalized, ['React', 'typescript'])
})

test('returns field errors when required candidate details are missing', () => {
  const errors = validateCandidateProfile({ ...COMPLETE_PROFILE, email: '', skills: [] })

  assert.deepEqual(errors, { email: 'Enter your email address.', skills: 'Add at least one skill.' })
})

test('accepts PDF resume metadata when file size is within the limit', () => {
  const result = validateResume(
    { name: 'aarav-resume.pdf', type: 'application/pdf', size: 240_000 },
    '2026-08-16T10:00:00.000Z',
  )

  assert.deepEqual(result, {
    kind: 'valid',
    resume: {
      name: 'aarav-resume.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 240_000,
      selectedAt: '2026-08-16T10:00:00.000Z',
    },
  })
})

test('rejects a duplicate application for the same job', () => {
  const first = submitApplication(EMPTY_CANDIDATE_STATE, {
    applicationId: 'app-local-1',
    jobSlug: 'frontend-engineer-atlas',
    company: 'Atlas Commerce',
    appliedDate: '16 Aug 2026',
    profile: COMPLETE_PROFILE,
    resume: {
      name: 'aarav-resume.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 240_000,
      selectedAt: '2026-08-16T10:00:00.000Z',
    },
    answers: [{ questionId: 'notice-period', value: '30 days' }],
  })
  assert.equal(first.kind, 'submitted')
  if (first.kind !== 'submitted') return

  const duplicate = submitApplication(first.state, {
    applicationId: 'app-local-2',
    jobSlug: 'frontend-engineer-atlas',
    company: 'Atlas Commerce',
    appliedDate: '16 Aug 2026',
    profile: COMPLETE_PROFILE,
    resume: first.state.resume,
    answers: [{ questionId: 'notice-period', value: '30 days' }],
  })

  assert.deepEqual(duplicate, { kind: 'duplicate', applicationId: 'app-local-1' })
})
