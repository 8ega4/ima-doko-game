import { BALL_RADIUS, simulateMotion } from './physics'
import type { GamePhase, Point, RoundResult, RoundSpec } from './types'

export const COLORS = {
  background: '#020713',
  field: '#031426',
  cyan: '#25d9ff',
  coral: '#ff654f',
  yellow: '#f4f700',
  white: '#f7f3ea',
  muted: '#91a7b8',
}

export type GameFrame = {
  phase: GamePhase
  elapsedMs: number
  guess: Point | null
  cursor: Point | null
  judgeDurationMs: number | null
  reducedMotion: boolean
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
  alpha = 1,
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
  context.globalAlpha = alpha
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
  for (let index = 1; index < 8; index += 1) {
    const position = padding + (inner * index) / 8
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
  context.strokeStyle = 'rgba(37, 217, 255, 0.16)'
  context.setLineDash([2, 7])
  context.beginPath()
  context.arc(size / 2, size / 2, inner * 0.25, 0, Math.PI * 2)
  context.stroke()
  context.beginPath()
  context.arc(size / 2, size / 2, inner * 0.42, 0, Math.PI * 2)
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

function drawIntroScan(context: CanvasRenderingContext2D, size: number, padding: number, elapsedMs: number, reducedMotion: boolean): void {
  const inner = size - padding * 2
  const progress = reducedMotion ? 0.5 : (elapsedMs % 500) / 500
  const y = padding + inner * progress
  context.save()
  context.strokeStyle = 'rgba(37, 217, 255, 0.72)'
  context.shadowColor = COLORS.cyan
  context.shadowBlur = reducedMotion ? 0 : size * 0.035
  context.lineWidth = Math.max(1.5, size * 0.005)
  context.beginPath()
  context.moveTo(padding, y)
  context.lineTo(size - padding, y)
  context.stroke()
  context.restore()
}

function drawAnswerProgress(
  context: CanvasRenderingContext2D,
  size: number,
  padding: number,
  elapsedMs: number,
  durationMs: number | null,
): void {
  const inner = size - padding * 2
  const inset = padding - size * 0.012
  const edge = inner + size * 0.024
  context.save()
  context.strokeStyle = COLORS.yellow
  context.lineWidth = Math.max(3, size * 0.009)
  if (durationMs !== null) {
    const remaining = Math.max(0, 1 - elapsedMs / durationMs)
    const perimeter = edge * 4
    context.setLineDash([Math.max(0.001, perimeter * remaining), perimeter])
    context.lineDashOffset = -edge * 0.5
    if (remaining < 0.3) context.strokeStyle = COLORS.coral
  }
  context.strokeRect(inset, inset, edge, edge)
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

  if (frame.phase === 'roundIntro') {
    drawIntroScan(context, size, padding, frame.elapsedMs, frame.reducedMotion)
  } else if (frame.phase === 'visible') {
    const current = simulateMotion(round.initial, Math.min(frame.elapsedMs, round.visibleDurationMs) / 1000)
    drawPolyline(context, current.points, size, padding, false)
    drawBall(context, current.state, size, padding)
  } else {
    const traceAlpha = frame.phase === 'hidden' ? 0.58 : frame.phase === 'judgeFrozen' ? 0.42 : 1
    drawPolyline(context, round.visibleTrace, size, padding, false, traceAlpha)
  }

  if (frame.phase === 'judgeFrozen') {
    drawAnswerProgress(context, size, padding, frame.elapsedMs, frame.judgeDurationMs)
    if (frame.cursor) drawGuess(context, frame.cursor, size, padding)
  }

  if (frame.phase === 'reveal') {
    const instant = frame.reducedMotion
    drawPolyline(context, round.hiddenTrace, size, padding, true, frame.elapsedMs >= 100 || instant ? 1 : 0.15)
    if (frame.elapsedMs >= 180 || instant) drawTarget(context, round.target, size, padding)
    if (frame.guess && (frame.elapsedMs >= 340 || instant)) {
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
