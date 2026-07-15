import { describe, expect, it } from 'vitest'
import { generateRoundSpecs } from './rounds'

describe('round generation', () => {
  it('replays identical rounds for an identical seed', () => {
    expect(generateRoundSpecs('challenge-42')).toEqual(generateRoundSpecs('challenge-42'))
  })

  it('creates three rounds with increasing hidden time', () => {
    const rounds = generateRoundSpecs('timing-check')
    expect(rounds).toHaveLength(3)
    expect(rounds.map((round) => round.hiddenDurationMs)).toEqual([1400, 1700, 2000])
  })

  it('keeps target positions within normalized field bounds', () => {
    for (const round of generateRoundSpecs('bounds-check')) {
      expect(round.target.x).toBeGreaterThan(0)
      expect(round.target.x).toBeLessThan(1)
      expect(round.target.y).toBeGreaterThan(0)
      expect(round.target.y).toBeLessThan(1)
    }
  })
})
