import { describe, expect, it } from 'vitest'
import { BALL_RADIUS, simulateMotion } from './physics'

describe('wall reflection physics', () => {
  it('moves without bouncing when no wall is reached', () => {
    const result = simulateMotion({ x: 0.5, y: 0.5, vx: 0.1, vy: -0.1 }, 1)
    expect(result.state.x).toBeCloseTo(0.6)
    expect(result.state.y).toBeCloseTo(0.4)
    expect(result.bounces).toBe(0)
  })

  it('reflects from the right wall', () => {
    const result = simulateMotion({ x: 0.9, y: 0.5, vx: 0.2, vy: 0 }, 1)
    expect(result.state.vx).toBeLessThan(0)
    expect(result.state.x).toBeLessThan(1 - BALL_RADIUS)
    expect(result.bounces).toBe(1)
  })

  it('handles a large delta without leaving the field', () => {
    const result = simulateMotion({ x: 0.3, y: 0.7, vx: 0.92, vy: -0.81 }, 9)
    expect(result.state.x).toBeGreaterThanOrEqual(BALL_RADIUS)
    expect(result.state.x).toBeLessThanOrEqual(1 - BALL_RADIUS)
    expect(result.state.y).toBeGreaterThanOrEqual(BALL_RADIUS)
    expect(result.state.y).toBeLessThanOrEqual(1 - BALL_RADIUS)
    expect(result.bounces).toBeGreaterThan(4)
  })
})
