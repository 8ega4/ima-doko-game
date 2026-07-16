import { useEffect, useRef, useState } from 'react'
import { drawGameFrame, normalizedPointFromPointer } from '../game/rendering'
import { JUDGE_DURATION_MS } from '../game/constants'
import type { GamePhase, Point, RoundSpec } from '../game/types'
import { useReducedMotion } from '../hooks/useReducedMotion'

type GameCanvasProps = {
  round: RoundSpec
  phase: GamePhase
  phaseStartedAt: number
  guess: Point | null
  relaxed: boolean
  onGuess: (point: Point) => void
}

const KEYBOARD_STEP = 0.025

export function GameCanvas({ round, phase, phaseStartedAt, guess, relaxed, onGuess }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cursor, setCursor] = useState<Point>({ x: 0.5, y: 0.5 })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setCursor({ x: 0.5, y: 0.5 })
  }, [round.index])

  useEffect(() => {
    if (phase === 'judgeFrozen') canvasRef.current?.focus({ preventScroll: true })
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let animationFrame = 0
    let disposed = false

    const render = () => {
      if (disposed) return
      const bounds = canvas.getBoundingClientRect()
      const size = Math.max(1, Math.floor(bounds.width))
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const targetWidth = Math.floor(size * ratio)
      if (canvas.width !== targetWidth || canvas.height !== targetWidth) {
        canvas.width = targetWidth
        canvas.height = targetWidth
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawGameFrame(context, size, round, {
        phase,
        elapsedMs: Math.max(0, performance.now() - phaseStartedAt),
        guess,
        cursor: phase === 'judgeFrozen' ? cursor : null,
        judgeDurationMs: relaxed ? null : JUDGE_DURATION_MS,
        reducedMotion,
      })
      animationFrame = requestAnimationFrame(render)
    }

    render()
    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
    }
  }, [cursor, guess, phase, phaseStartedAt, reducedMotion, relaxed, round])

  return (
    <canvas
      ref={canvasRef}
      className={`game-canvas ${phase === 'judgeFrozen' ? 'is-answering' : ''}`}
      aria-label={phase === 'judgeFrozen' ? 'ボールがいると思う場所をタップ' : 'ボールの軌道'}
      aria-describedby="game-canvas-help"
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Enter"
      role="application"
      tabIndex={phase === 'judgeFrozen' ? 0 : -1}
      onPointerDown={(event) => {
        if (phase !== 'judgeFrozen') return
        const bounds = event.currentTarget.getBoundingClientRect()
        onGuess(normalizedPointFromPointer(event.clientX, event.clientY, bounds))
      }}
      onKeyDown={(event) => {
        if (phase !== 'judgeFrozen') return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onGuess(cursor)
          return
        }
        const delta = {
          ArrowUp: { x: 0, y: -KEYBOARD_STEP },
          ArrowDown: { x: 0, y: KEYBOARD_STEP },
          ArrowLeft: { x: -KEYBOARD_STEP, y: 0 },
          ArrowRight: { x: KEYBOARD_STEP, y: 0 },
        }[event.key]
        if (!delta) return
        event.preventDefault()
        setCursor((current) => ({
          x: Math.min(1, Math.max(0, current.x + delta.x)),
          y: Math.min(1, Math.max(0, current.y + delta.y)),
        }))
      }}
    />
  )
}
