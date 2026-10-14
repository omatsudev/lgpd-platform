import type { Clock } from '../application/ports'
import type { RandomSource } from '../domain/random'

export const systemClock: Clock = { now: () => new Date() }

/** Cryptographically secure source, so exam draws and certificate codes are unpredictable. */
export const cryptoRandom: RandomSource = () => {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] / 2 ** 32
}
