import { describe, expect, it } from 'vitest'
import content from '../../fixtures/lgpd-training-track.json'

// Guards the official content loaded by migration 057 (same source file).
describe('official LGPD track content', () => {
  it('has 3 modules and 12 videos with 19min30s in total', () => {
    expect(content.modules).toHaveLength(3)
    expect(content.videos).toHaveLength(12)
    expect(content.videos.reduce((sum, video) => sum + video.durationSeconds, 0)).toBe(19 * 60 + 30)
  })

  it('has 4 quiz questions per video with 4 options and a valid answer', () => {
    expect(content.videoQuestions).toHaveLength(48)
    for (let video = 1; video <= 12; video++) {
      expect(content.videoQuestions.filter((q) => q.video === video)).toHaveLength(4)
    }
    for (const question of [...content.videoQuestions, ...content.examQuestions]) {
      expect(question.options).toHaveLength(4)
      expect(['A', 'B', 'C', 'D']).toContain(question.answer)
      expect(question.prompt.length).toBeGreaterThan(5)
      expect(question.explanation.length).toBeGreaterThan(5)
    }
  })

  it('has a bank of 50 exam questions able to fill the 5 + 4 + 6 draw', () => {
    expect(content.examQuestions).toHaveLength(50)
    for (const trackModule of content.modules) {
      const bank = content.examQuestions.filter((q) => q.module === trackModule.position)
      expect(bank.length).toBeGreaterThanOrEqual(trackModule.finalExamQuestionCount * 2)
    }
    expect(content.modules.reduce((sum, m) => sum + m.finalExamQuestionCount, 0)).toBe(15)
  })

  it('keeps quizzes and the exam bank as separate questions', () => {
    // Three bank prompts (B33, B39, B46) reuse the wording of quiz questions
    // 8.2, 9.2 and 11.1, but with different alternatives, as in the source document.
    const questions = [...content.videoQuestions, ...content.examQuestions]
    const codes = questions.map((q) => q.code)
    const signatures = questions.map((q) => `${q.prompt}|${[...q.options].sort().join('|')}`)
    expect(new Set(codes).size).toBe(questions.length)
    expect(new Set(signatures).size).toBe(questions.length)
  })
})
