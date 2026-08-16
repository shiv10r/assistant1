export type ScreeningQuestionType = 'text' | 'yes-no'

export type ScreeningQuestion = {
  readonly id: string
  readonly prompt: string
  readonly type: ScreeningQuestionType
  readonly required: boolean
}

export const FALLBACK_SCREENING_QUESTIONS: readonly ScreeningQuestion[] = [
  { id: 'notice-period', prompt: 'What is your current notice period?', type: 'text', required: true },
  { id: 'salary-expectation', prompt: 'What is your expected annual compensation?', type: 'text', required: true },
  { id: 'work-authorisation', prompt: 'Are you legally authorised to work in India?', type: 'yes-no', required: true },
] as const

export function resolveScreeningQuestions(
  custom: readonly ScreeningQuestion[] | undefined,
): readonly ScreeningQuestion[] {
  return custom && custom.length > 0 ? custom : FALLBACK_SCREENING_QUESTIONS
}