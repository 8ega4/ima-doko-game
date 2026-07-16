import { useEffect, useMemo, useRef } from 'react'
import { drawGameFrame } from '../game/rendering'
import { generateRoundSpecs } from '../game/rounds'
import type { GamePhase, Point } from '../game/types'
import { useReducedMotion } from '../hooks/useReducedMotion'

const CYCLE_MS = 4600
const DEMO_GUESS: Point = { x: 0.7, y: 0.42 }

function getDemoPhase(elapsed: number): { phase: GamePhase; phaseElapsed: number } {
  if (elapsed < 500) return { phase: 'roundIntro', phaseElapsed: elapsed }
  if (elapsed < 1700) return { phase: 'visible', phaseElapsed: elapsed - 500 }
  if (elapsed < 3000) return { phase: 'hidden', phaseElapsed: elapsed - 1700 }
  return { phase: 'reveal', phaseElapsed: elapsed - 3000 }
}

export function TitleDemoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const round = useMemo(() => generateRoundSpecs('title-demo')[1], [])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const startedAt = performance.now()
    let frame = 0
    let disposed = false

    const render = () => {
      if (disposed) return
      const bounds = canvas.getBoundingClientRect()
      const size = Math.max(1, Math.floor(bounds.width))
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const targetSize = Math.floor(size * ratio)
      if (canvas.width !== targetSize || canvas.height !== targetSize) {
        canvas.width = targetSize
        canvas.height = targetSize
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const elapsed = reducedMotion ? 3900 : (performance.now() - startedAt) % CYCLE_MS
      const state = getDemoPhase(elapsed)
      drawGameFrame(context, size, round, {
        phase: state.phase,
        elapsedMs: state.phaseElapsed,
        guess: state.phase === 'reveal' ? DEMO_GUESS : null,
        cursor: null,
        judgeDurationMs: null,
        reducedMotion,
      })
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }

    render()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion, round])

  return <canvas ref={canvasRef} className="demo-canvas" aria-hidden="true" />
}
