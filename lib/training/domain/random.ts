/** Returns a float in [0, 1). Injected so domain rules stay deterministic under test. */
export type RandomSource = () => number

export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function sample<T>(items: readonly T[], count: number, random: RandomSource): T[] {
  return shuffle(items, random).slice(0, count)
}
