import type { MotionState, MotionTrace, Point } from './types'

export const BALL_RADIUS = 0.028
const MIN = BALL_RADIUS
const MAX = 1 - BALL_RADIUS
const EPSILON = 1e-8
const MAX_COLLISIONS = 32

function timeToBoundary(position: number, velocity: number): number {
  if (Math.abs(velocity) < EPSILON) {
    return Number.POSITIVE_INFINITY
  }

  return velocity > 0 ? (MAX - position) / velocity : (MIN - position) / velocity
}

export function simulateMotion(initial: MotionState, durationSeconds: number): MotionTrace {
  let state = { ...initial }
  let remaining = Math.max(0, durationSeconds)
  let bounces = 0
  let collisionCount = 0
  const points: Point[] = [{ x: state.x, y: state.y }]

  while (remaining > EPSILON && collisionCount < MAX_COLLISIONS) {
    const hitX = timeToBoundary(state.x, state.vx)
    const hitY = timeToBoundary(state.y, state.vy)
    const nextHit = Math.min(hitX, hitY)

    if (!Number.isFinite(nextHit) || nextHit > remaining + EPSILON) {
      state = {
        ...state,
        x: state.x + state.vx * remaining,
        y: state.y + state.vy * remaining,
      }
      remaining = 0
      break
    }

    const travel = Math.max(0, nextHit)
    state = {
      ...state,
      x: Math.min(MAX, Math.max(MIN, state.x + state.vx * travel)),
      y: Math.min(MAX, Math.max(MIN, state.y + state.vy * travel)),
    }
    remaining -= travel
    points.push({ x: state.x, y: state.y })

    const hitVertical = Math.abs(hitX - nextHit) < EPSILON
    const hitHorizontal = Math.abs(hitY - nextHit) < EPSILON

    if (hitVertical) {
      state.vx *= -1
      bounces += 1
    }
    if (hitHorizontal) {
      state.vy *= -1
      bounces += 1
    }

    collisionCount += 1

    if (travel < EPSILON) {
      remaining = Math.max(0, remaining - EPSILON)
    }
  }

  state.x = Math.min(MAX, Math.max(MIN, state.x))
  state.y = Math.min(MAX, Math.max(MIN, state.y))
  points.push({ x: state.x, y: state.y })

  return { state, points: dedupePoints(points), bounces }
}

function dedupePoints(points: Point[]): Point[] {
  return points.filter((point, index) => {
    const previous = points[index - 1]
    return !previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPSILON
  })
}

export function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
