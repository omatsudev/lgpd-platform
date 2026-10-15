import { TrainingError } from '@/lib/training/domain/errors'
import {
  bestScore,
  drawExamPaper,
  examBlueprint,
  examEligibility,
} from '@/lib/training/domain/exam'
import type { ExamAttempt } from '@/lib/training/domain/types'
import { describe, expect, it } from 'vitest'
import { buildLgpdTrackFixture } from '../../support/training/lgpd-track-fixture'
import { seededRandom } from '../../support/training/seeded-random'

const { track, questions } = buildLgpdTrackFixture()
const moduleOf = (questionId: string) => questions.find((q) => q.id === questionId)!.moduleId

describe('drawExamPaper', () => {
  it('draws 5 + 4 + 6 questions from the bank, as in the quiz document', () => {
    const paper = drawExamPaper(questions, examBlueprint(track), seededRandom(1))
    expect(paper).toHaveLength(15)
    const perModule = paper.reduce<Record<string, number>>((acc, item) => {
      const moduleId = moduleOf(item.questionId)!
      acc[moduleId] = (acc[moduleId] ?? 0) + 1
      return acc
    }, {})
    expect(perModule).toEqual({ 'module-1': 5, 'module-2': 4, 'module-3': 6 })
  })

  it('never uses video quiz questions and never repeats a question', () => {
    const paper = drawExamPaper(questions, examBlueprint(track), seededRandom(2))
    const ids = paper.map((item) => item.questionId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith('question-B'))).toBe(true)
  })

  it('shuffles options but keeps every option of the question', () => {
    const paper = drawExamPaper(questions, examBlueprint(track), seededRandom(3))
    for (const item of paper) {
      const original = questions.find((q) => q.id === item.questionId)!.options.map((o) => o.id)
      expect([...item.optionIds].sort()).toEqual([...original].sort())
    }
    const anyReordered = paper.some(
      (item) =>
        item.optionIds.join() !==
        questions
          .find((q) => q.id === item.questionId)!
          .options.map((o) => o.id)
          .join(),
    )
    expect(anyReordered).toBe(true)
  })

  it('draws a different paper on a new attempt', () => {
    const first = drawExamPaper(questions, examBlueprint(track), seededRandom(4))
    const second = drawExamPaper(questions, examBlueprint(track), seededRandom(5))
    expect(first.map((i) => i.questionId)).not.toEqual(second.map((i) => i.questionId))
  })

  it('fails clearly when a module bank is too small', () => {
    const blueprint = [{ moduleId: 'module-2', questionCount: 20 }]
    expect(() => drawExamPaper(questions, blueprint, seededRandom(1))).toThrow(TrainingError)
  })
})

const attempt = (overrides: Partial<ExamAttempt>): ExamAttempt => ({
  id: 'a',
  enrollmentId: 'e',
  paper: [],
  answers: {},
  correctCount: 0,
  totalCount: 15,
  scoreRatio: 0.5,
  passed: false,
  startedAt: new Date(),
  submittedAt: new Date(),
  ...overrides,
})

describe('examEligibility', () => {
  it('allows unlimited attempts when no limit is configured', () => {
    expect(examEligibility([attempt({}), attempt({})], null)).toEqual({
      canStart: true,
      remainingAttempts: null,
    })
  })

  it('counts remaining attempts against the configured limit', () => {
    expect(examEligibility([attempt({})], 3)).toEqual({ canStart: true, remainingAttempts: 2 })
    expect(examEligibility([attempt({}), attempt({}), attempt({})], 3)).toEqual({
      canStart: false,
      reason: 'attempts_exhausted',
    })
  })

  it('blocks new attempts after passing', () => {
    expect(examEligibility([attempt({ passed: true })], null)).toEqual({
      canStart: false,
      reason: 'already_passed',
    })
  })
})

describe('bestScore', () => {
  it('returns the highest submitted score or null', () => {
    expect(bestScore([])).toBeNull()
    expect(bestScore([attempt({ scoreRatio: 0.6 }), attempt({ scoreRatio: 0.8 })])).toBe(0.8)
  })
})
