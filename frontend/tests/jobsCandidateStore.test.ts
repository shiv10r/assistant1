import assert from 'node:assert/strict'
import test from 'node:test'
import { EMPTY_CANDIDATE_STATE } from '../src/services/jobs/candidateApplication.ts'
import {
  CANDIDATE_STORAGE_KEY,
  readCandidateState,
  saveApplicationDraft,
  writeCandidateState,
} from '../src/services/jobs/candidateStore.ts'

class MemoryStorage {
  readonly #values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value)
  }

  removeItem(key: string): void {
    this.#values.delete(key)
  }
}

test('resets only candidate state when stored JSON is malformed', () => {
  const storage = new MemoryStorage()
  storage.setItem(CANDIDATE_STORAGE_KEY, '{broken')
  storage.setItem('unrelated', 'preserved')

  const state = readCandidateState(storage)

  assert.deepEqual(state, EMPTY_CANDIDATE_STATE)
  assert.equal(storage.getItem(CANDIDATE_STORAGE_KEY), null)
  assert.equal(storage.getItem('unrelated'), 'preserved')
})

test('replaces a draft when the same job is saved again', () => {
  const first = saveApplicationDraft(EMPTY_CANDIDATE_STATE, {
    jobSlug: 'frontend-engineer-atlas',
    answers: [{ questionId: 'notice-period', value: '60 days' }],
    updatedAt: '2026-08-16T10:00:00.000Z',
  })

  const second = saveApplicationDraft(first, {
    jobSlug: 'frontend-engineer-atlas',
    answers: [{ questionId: 'notice-period', value: '30 days' }],
    updatedAt: '2026-08-16T11:00:00.000Z',
  })

  assert.equal(second.drafts.length, 1)
  assert.equal(second.drafts[0]?.answers[0]?.value, '30 days')
})

test('reads a state written through the candidate storage boundary', () => {
  const storage = new MemoryStorage()
  const state = saveApplicationDraft(EMPTY_CANDIDATE_STATE, {
    jobSlug: 'frontend-engineer-atlas',
    answers: [],
    updatedAt: '2026-08-16T10:00:00.000Z',
  })

  writeCandidateState(storage, state)

  assert.deepEqual(readCandidateState(storage), state)
})
