import { createPrng } from './prng'
import { simulateMotion } from './physics'
import type { MotionState, RoundSpec } from './types'
import { BASE_BALL_SPEED, ROUND_DIFFICULTY, TOTAL_ROUNDS } from './constants'

const MAX_ATTEMPTS = 400

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
  return ROUND_DIFFICULTY.map((settings, index) => {
    const random = createPrng(`${seed}:${index}`)
    let selected: RoundSpec | null = null
    let closest: { difference: number; spec: RoundSpec } | null = null

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const speed = BASE_BALL_SPEED * settings.speedMultiplier * (0.98 + random() * 0.04)
      const initial = createInitialState(random, speed)
      const visible = simulateMotion(initial, settings.visibleDurationMs / 1000)
      const hidden = simulateMotion(visible.state, settings.hiddenDurationMs / 1000)
      const totalBounces = visible.bounces + hidden.bounces
      const spec: RoundSpec = {
        index,
        speedMultiplier: settings.speedMultiplier,
        difficultyLabel: settings.introLabel,
        visibleDurationMs: settings.visibleDurationMs,
        hiddenDurationMs: settings.hiddenDurationMs,
        targetBounces: totalBounces,
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

if (ROUND_DIFFICULTY.length !== TOTAL_ROUNDS) {
  throw new Error('ラウンド設定数がTOTAL_ROUNDSと一致していません')
}
