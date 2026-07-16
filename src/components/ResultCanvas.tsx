import { useEffect, useRef } from 'react'
import { drawResultField } from '../game/rendering'
import type { RoundResult } from '../game/types'

export function ResultCanvas({ result }: { result: RoundResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      const size = Math.max(1, Math.floor(bounds.width))
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(size * ratio)
      canvas.height = Math.floor(size * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawResultField(context, size, result)
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [result])

  return (
    <canvas
      ref={canvasRef}
      className="result-canvas"
      role="img"
      aria-label={`ラウンド${result.round.index + 1}、${result.score}点。推測位置と正解位置の誤差は${result.errorPx}pxです。`}
    />
  )
}
