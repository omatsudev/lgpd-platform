import {
  gradeAnswers,
  hasPassed,
  isAnswerCorrect,
  minimumCorrectAnswers,
} from '@/lib/training/domain/grading'
import { describe, expect, it } from 'vitest'

describe('isAnswerCorrect', () => {
  it('compares single choice answers by option id', () => {
    expect(isAnswerCorrect(['b'], ['b'])).toBe(true)
    expect(isAnswerCorrect(['a'], ['b'])).toBe(false)
  })

  it('requires the exact set for multiple choice answers', () => {
    expect(isAnswerCorrect(['c', 'a'], ['a', 'c'])).toBe(true)
    expect(isAnswerCorrect(['a'], ['a', 'c'])).toBe(false)
    expect(isAnswerCorrect(['a', 'c', 'd'], ['a', 'c'])).toBe(false)
    expect(isAnswerCorrect(['a', 'a'], ['a', 'c'])).toBe(false)
  })

  it('is never correct without an answer key', () => {
    expect(isAnswerCorrect([], [])).toBe(false)
  })
})

describe('gradeAnswers', () => {
  const key = new Map([
    ['q1', ['q1-b']],
    ['q2', ['q2-a']],
    ['q3', ['q3-d']],
    ['q4', ['q4-c']],
  ])

  it('counts correct answers and treats missing answers as wrong', () => {
    const result = gradeAnswers(['q1', 'q2', 'q3', 'q4'], key, {
      q1: ['q1-b'],
      q2: ['q2-a'],
      q3: ['q3-a'],
    })
    expect(result.correctCount).toBe(2)
    expect(result.totalCount).toBe(4)
    expect(result.scoreRatio).toBe(0.5)
    expect(result.questions.map((q) => q.isCorrect)).toEqual([true, true, false, false])
  })
})

describe('pass rules from the quiz document', () => {
  it('video quiz: 3 of 4 (75%)', () => {
    expect(minimumCorrectAnswers(4, 0.75)).toBe(3)
    expect(hasPassed(3, 4, 0.75)).toBe(true)
    expect(hasPassed(2, 4, 0.75)).toBe(false)
  })

  it('final exam: 11 of 15 (minimum 70%)', () => {
    expect(minimumCorrectAnswers(15, 0.7)).toBe(11)
    expect(hasPassed(11, 15, 0.7)).toBe(true)
    expect(hasPassed(10, 15, 0.7)).toBe(false)
  })

  it('never passes an empty quiz', () => {
    expect(hasPassed(0, 0, 0.7)).toBe(false)
  })
})
