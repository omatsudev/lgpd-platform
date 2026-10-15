import { sample, shuffle } from '@/lib/training/domain/random'
import { describe, expect, it } from 'vitest'
import { seededRandom } from '../../support/training/seeded-random'

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5, 6]
    const result = shuffle(input, seededRandom(1))
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('is deterministic for the same random source', () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRandom(7))).toEqual(
      shuffle([1, 2, 3, 4, 5], seededRandom(7)),
    )
  })

  it('actually changes the order for some seeds', () => {
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) => shuffle([1, 2, 3, 4], seededRandom(seed)).join()),
    )
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('sample', () => {
  it('picks the requested number of distinct items', () => {
    const result = sample(['a', 'b', 'c', 'd', 'e'], 3, seededRandom(3))
    expect(result).toHaveLength(3)
    expect(new Set(result).size).toBe(3)
  })
})
