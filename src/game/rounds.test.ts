import { describe, expect, it } from 'vitest'
import { generateRoundSpecs } from './rounds'
import {
  ESTIMATED_PLAY_SECONDS,
  EXPECTED_ACTIVE_PLAY_DURATION_MS,
  ROUND_DIFFICULTY,
  TOTAL_ROUNDS,
} from './constants'

describe('round generation', () => {
  it('replays identical rounds for an identical seed', () => {
    expect(generateRoundSpecs('challenge-42')).toEqual(generateRoundSpecs('challenge-42'))
  })

  it('creates five rounds with configured timing and bounce targets', () => {
    const rounds = generateRoundSpecs('timing-check')
    expect(rounds).toHaveLength(TOTAL_ROUNDS)
    expect(rounds.map((round) => round.visibleDurationMs)).toEqual([1300, 1250, 1200, 1100, 1000])
    expect(rounds.map((round) => round.hiddenDurationMs)).toEqual([1200, 1300, 1450, 1600, 1800])
    expect(rounds.map((round) => round.targetBounces)).toEqual(ROUND_DIFFICULTY.map((round) => round.targetBounces))
  })

  it('keeps the active five-round session near 25 seconds', () => {
    expect(EXPECTED_ACTIVE_PLAY_DURATION_MS).toBe(24_700)
    expect(ESTIMATED_PLAY_SECONDS).toBe(25)
  })

  it('strictly increases actual ball speed every round', () => {
    for (let seedIndex = 0; seedIndex < 50; seedIndex += 1) {
      const speeds = generateRoundSpecs(`speed-check-${seedIndex}`).map((round) => Math.hypot(round.initial.vx, round.initial.vy))
      expect(speeds).toHaveLength(TOTAL_ROUNDS)
      for (let index = 1; index < speeds.length; index += 1) {
        expect(speeds[index]).toBeGreaterThan(speeds[index - 1])
      }
    }
  })

  it('hits the requested bounce count across representative seeds', () => {
    for (let seedIndex = 0; seedIndex < 50; seedIndex += 1) {
      expect(generateRoundSpecs(`bounce-check-${seedIndex}`).map((round) => round.targetBounces))
        .toEqual(ROUND_DIFFICULTY.map((round) => round.targetBounces))
    }
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
