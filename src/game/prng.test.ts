import { describe, expect, it } from 'vitest'
import { createPrng, sanitizeSeed } from './prng'

describe('seeded random generator', () => {
  it('replays the same sequence for the same seed', () => {
    const first = createPrng('same-seed')
    const second = createPrng('same-seed')
    expect(Array.from({ length: 8 }, first)).toEqual(Array.from({ length: 8 }, second))
  })

  it('changes the sequence for another seed', () => {
    const first = createPrng('seed-a')
    const second = createPrng('seed-b')
    expect(Array.from({ length: 4 }, first)).not.toEqual(Array.from({ length: 4 }, second))
  })

  it('accepts only bounded URL-safe seed values', () => {
    expect(sanitizeSeed('abc_123-Z')).toBe('abc_123-Z')
    expect(sanitizeSeed('')).toBeNull()
    expect(sanitizeSeed('../bad')).toBeNull()
    expect(sanitizeSeed('a'.repeat(65))).toBeNull()
  })
})
