import { BALL_RADIUS, simulateMotion } from './physics'
import { JUDGE_DURATION_MS } from './constants'
import type { GamePhase, Point, RoundResult, RoundSpec } from './types'

export const COLORS = {
  background: '#020713',
  field: '#031426',
  cyan: '#25d9ff',
  cyanMuted: 'rgba(37, 217, 255, 0.24)',
  coral: '#ff654f',
  yellow: '#f4f700',
  white: '#f7f3ea',
  muted: '#91a7b8',
}

export type GameFrame = {
  phase: GamePhase
  elapsedMs: number
  guess: Point | null
}

function mapPoint(point: Point, size: number, padding: number): Point {
  const inner = size - padding * 2
  return {
    x: padding + point.x * inner,
    y: padding + point.y * inner,
  }
}

function drawPolyline(
  context: CanvasRenderingContext2D,
  points: Point[],
  size: number,
  padding: number,
  dashed: boolean,
): void {
  if (points.length < 2) return
  context.save()
  context.beginPath()
  points.forEach((point, index) => {
    const mapped = mapPoint(point, size, padding)
    if (index === 0) context.moveTo(mapped.x, mapped.y)
    else context.lineTo(mapped.x, mapped.y)
  })
  context.strokeStyle = COLORS.coral
  context.lineWidth = Math.max(3, size * 0.012)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.setLineDash(dashed ? [Math.max(3, size * 0.012), Math.max(6, size * 0.025)] : [])
  context.stroke()
  context.restore()
}

function drawFieldChrome(context: CanvasRenderingContext2D, size: number, padding: number): void {
  context.fillStyle = COLORS.field
  context.fillRect(0, 0, size, size)

  const inner = size - padding * 2
  context.save()
  context.strokeStyle = 'rgba(37, 217, 255, 0.08)'
  context.lineWidth = 1
  for (let index = 1; index < 10; index += 1) {
    const position = padding + (inner * index) / 10
    context.beginPath()
    context.moveTo(position, padding)
    context.lineTo(position, size - padding)
    context.stroke()
    context.beginPath()
    context.moveTo(padding, position)
    context.lineTo(size - padding, position)
    context.stroke()
  }
  context.restore()

  context.save()
  context.strokeStyle = COLORS.cyan
  context.lineWidth = Math.max(2, size * 0.006)
  context.strokeRect(padding, padding, inner, inner)
  context.strokeStyle = COLORS.cyanMuted
  context.setLineDash([2, 7])
  context.beginPath()
  context.arc(size / 2, size / 2, inner * 0.26, 0, Math.PI * 2)
  context.stroke()
  context.beginPath()
  context.arc(size / 2, size / 2, inner * 0.43, 0, Math.PI * 2)
  context.stroke()
  context.restore()

  context.save()
  context.strokeStyle = COLORS.cyan
  context.lineWidth = 1.5
  for (let index = 0; index <= 8; index += 1) {
    const position = padding + (inner * index) / 8
    const length = index === 4 ? 10 : 6
    context.beginPath()
    context.moveTo(position, padding - length)
    context.lineTo(position, padding)
    context.moveTo(position, size - padding)
    context.lineTo(position, size - padding + length)
    context.moveTo(padding - length, position)
    context.lineTo(padding, position)
    context.moveTo(size - padding, position)
    context.lineTo(size - padding + length, position)
    context.stroke()
  }
  context.restore()
}

function drawBall(context: CanvasRenderingContext2D, point: Point, size: number, padding: number): void {
  const mapped = mapPoint(point, size, padding)
  const inner = size - padding * 2
  const radius = BALL_RADIUS * inner
  context.save()
  context.shadowColor = COLORS.coral
  context.shadowBlur = radius * 1.3
  context.fillStyle = COLORS.coral
  context.beginPath()
  context.arc(mapped.x, mapped.y, radius, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawTarget(context: CanvasRenderingContext2D, point: Point, size: number, padding: number): void {
  const mapped = mapPoint(point, size, padding)
  context.save()
  context.strokeStyle = COLORS.coral
  context.lineWidth = Math.max(3, size * 0.009)
  context.beginPath()
  context.arc(mapped.x, mapped.y, size * 0.035, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

function drawGuess(context: CanvasRenderingContext2D, point: Point, size: number, padding: number): void {
  const mapped = mapPoint(point, size, padding)
  const arm = size * 0.036
  context.save()
  context.strokeStyle = COLORS.yellow
  context.lineWidth = Math.max(5, size * 0.014)
  context.lineCap = 'square'
  context.beginPath()
  context.moveTo(mapped.x - arm, mapped.y - arm)
  context.lineTo(mapped.x + arm, mapped.y + arm)
  context.moveTo(mapped.x + arm, mapped.y - arm)
  context.lineTo(mapped.x - arm, mapped.y + arm)
  context.stroke()
  context.restore()
}

function drawErrorLine(
  context: CanvasRenderingContext2D,
  target: Point,
  guess: Point,
  size: number,
  padding: number,
): void {
  const from = mapPoint(target, size, padding)
  const to = mapPoint(guess, size, padding)
  context.save()
  context.strokeStyle = COLORS.white
  context.globalAlpha = 0.82
  context.lineWidth = Math.max(1.5, size * 0.004)
  context.setLineDash([4, 5])
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
  context.restore()
}

export function drawGameFrame(
  context: CanvasRenderingContext2D,
  size: number,
  round: RoundSpec,
  frame: GameFrame,
): void {
  const padding = size * 0.055
  context.clearRect(0, 0, size, size)
  drawFieldChrome(context, size, padding)

  if (frame.phase === 'visible') {
    const current = simulateMotion(round.initial, Math.min(frame.elapsedMs, round.visibleDurationMs) / 1000)
    drawPolyline(context, current.points, size, padding, false)
    drawBall(context, current.state, size, padding)
  } else if (frame.phase !== 'roundIntro') {
    drawPolyline(context, round.visibleTrace, size, padding, false)
  }

  if (frame.phase === 'judgeFrozen') {
    const pulse = 0.45 + Math.sin(frame.elapsedMs / 160) * 0.12
    context.save()
    context.strokeStyle = `rgba(244, 247, 0, ${pulse})`
    context.lineWidth = 2
    context.beginPath()
    context.arc(size / 2, size / 2, size * (0.11 + (frame.elapsedMs % 800) / 4800), 0, Math.PI * 2)
    context.stroke()
    context.restore()

    const remaining = Math.max(0, 1 - frame.elapsedMs / JUDGE_DURATION_MS)
    const barWidth = size * 0.5
    const barHeight = Math.max(4, size * 0.014)
    const barX = (size - barWidth) / 2
    const barY = size - padding - size * 0.045
    context.fillStyle = 'rgba(244, 247, 0, 0.18)'
    context.fillRect(barX, barY, barWidth, barHeight)
    context.fillStyle = remaining < 0.3 ? COLORS.coral : COLORS.yellow
    context.fillRect(barX, barY, barWidth * remaining, barHeight)
  }

  if (frame.phase === 'reveal') {
    drawPolyline(context, round.hiddenTrace, size, padding, true)
    drawTarget(context, round.target, size, padding)
    if (frame.guess) {
      drawErrorLine(context, round.target, frame.guess, size, padding)
      drawGuess(context, frame.guess, size, padding)
    }
  }
}

export function drawResultField(
  context: CanvasRenderingContext2D,
  size: number,
  result: RoundResult,
): void {
  const padding = size * 0.055
  context.clearRect(0, 0, size, size)
  drawFieldChrome(context, size, padding)
  drawPolyline(context, result.round.visibleTrace, size, padding, false)
  drawPolyline(context, result.round.hiddenTrace, size, padding, true)
  drawTarget(context, result.round.target, size, padding)
  if (result.guess) {
    drawErrorLine(context, result.round.target, result.guess, size, padding)
    drawGuess(context, result.guess, size, padding)
  }
}

export function normalizedPointFromPointer(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
): Point {
  return {
    x: Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)),
    y: Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height)),
  }
}
