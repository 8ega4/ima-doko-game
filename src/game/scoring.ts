import { MAX_SCORE_PER_ROUND, MAX_TOTAL_SCORE } from './constants'

const TITLES = [
  { minimum: MAX_TOTAL_SCORE, title: '完全追跡者' },
  { minimum: 470, title: '預言者' },
  { minimum: 420, title: '物理学者' },
  { minimum: 350, title: '追跡者' },
  { minimum: 250, title: '目で追う人' },
  { minimum: 150, title: '軌道迷子' },
  { minimum: 0, title: 'ボールと絶縁' },
] as const

export function scoreDistance(distance: number): number {
  const distancePercent = distance * 100
  return Math.max(0, Math.min(MAX_SCORE_PER_ROUND, Math.round(MAX_SCORE_PER_ROUND - distancePercent * 2.5)))
}

export function getTitle(totalScore: number): string {
  return TITLES.find(({ minimum }) => totalScore >= minimum)?.title ?? 'ボールと絶縁'
}

export function toCanonicalPixels(distance: number): number {
  return Math.round(distance * 390)
}
