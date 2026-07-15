import { useEffect, useRef } from 'react'
import { drawGameFrame, normalizedPointFromPointer } from '../game/rendering'
import type { GamePhase, Point, RoundSpec } from '../game/types'

type GameCanvasProps = {
  round: RoundSpec
  phase: GamePhase
  phaseStartedAt: number
  guess: Point | null
  onGuess: (point: Point) => void
}

export function GameCanvas({ round, phase, phaseStartedAt, guess, onGuess }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      })
      animationFrame = requestAnimationFrame(render)
    }

    render()
    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
    }
  }, [guess, phase, phaseStartedAt, round])

  return (
    <canvas
      ref={canvasRef}
      className={`game-canvas ${phase === 'judgeFrozen' ? 'is-answering' : ''}`}
      aria-label={phase === 'judgeFrozen' ? 'ボールがいると思う場所をタップ' : 'ボールの軌道'}
      onPointerDown={(event) => {
        if (phase !== 'judgeFrozen') return
        const bounds = event.currentTarget.getBoundingClientRect()
        onGuess(normalizedPointFromPointer(event.clientX, event.clientY, bounds))
      }}
    />
  )
}
