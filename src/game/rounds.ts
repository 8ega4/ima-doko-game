import { createPrng } from './prng'
import { simulateMotion } from './physics'
import type { MotionState, RoundSpec } from './types'

const ROUND_SETTINGS = [
  { hiddenDurationMs: 1400, targetBounces: 0, speed: 0.26 },
  { hiddenDurationMs: 1700, targetBounces: 1, speed: 0.34 },
  { hiddenDurationMs: 2000, targetBounces: 2, speed: 0.44 },
] as const

const VISIBLE_DURATION_MS = 1200
const MAX_ATTEMPTS = 240

function createInitialState(random: () => number, speed: number): MotionState {
  const angle = random() * Math.PI * 2
  return {
    x: 0.18 + random() * 0.64,
    y: 0.18 + random() * 0.64,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  }
}

export function generateRoundSpecs(seed: string): RoundSpec[] {
  return ROUND_SETTINGS.map((settings, index) => {
    const random = createPrng(`${seed}:${index}`)
    let selected: RoundSpec | null = null
    let closest: { difference: number; spec: RoundSpec } | null = null

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const initial = createInitialState(random, settings.speed * (0.92 + random() * 0.16))
      const visible = simulateMotion(initial, VISIBLE_DURATION_MS / 1000)
      const hidden = simulateMotion(visible.state, settings.hiddenDurationMs / 1000)
      const totalBounces = visible.bounces + hidden.bounces
      const spec: RoundSpec = {
        index,
        visibleDurationMs: VISIBLE_DURATION_MS,
        hiddenDurationMs: settings.hiddenDurationMs,
        targetBounces: settings.targetBounces,
        initial,
        visibleTrace: visible.points,
        hiddenTrace: hidden.points,
        target: { x: hidden.state.x, y: hidden.state.y },
      }
      const difference = Math.abs(totalBounces - settings.targetBounces)

      if (!closest || difference < closest.difference) {
        closest = { difference, spec }
      }

      if (difference === 0) {
        selected = spec
        break
      }
    }

    return selected ?? closest!.spec
  })
}
