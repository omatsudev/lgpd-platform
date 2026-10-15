export type TrainingErrorCode =
  | 'NOT_FOUND'
  | 'LOCKED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'ATTEMPTS_EXHAUSTED'
  | 'ALREADY_SUBMITTED'
  | 'INSUFFICIENT_QUESTION_BANK'

export class TrainingError extends Error {
  constructor(
    readonly code: TrainingErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'TrainingError'
  }
}

export const notFound = (what: string) => new TrainingError('NOT_FOUND', `${what} not found`)
export const locked = (what: string) => new TrainingError('LOCKED', `${what} is locked`)
export const forbidden = (reason: string) => new TrainingError('FORBIDDEN', reason)
export const invalidInput = (reason: string) => new TrainingError('INVALID_INPUT', reason)
