const TITLES = [
  { minimum: 270, title: '預言者' },
  { minimum: 225, title: '物理学者' },
  { minimum: 165, title: '追跡者' },
  { minimum: 90, title: '一般人' },
  { minimum: 0, title: 'ボールと絶縁' },
] as const

export function scoreDistance(distance: number): number {
  const distancePercent = distance * 100
  return Math.max(0, Math.min(100, Math.round(100 - distancePercent * 2.5)))
}

export function getTitle(totalScore: number): string {
  return TITLES.find(({ minimum }) => totalScore >= minimum)?.title ?? 'ボールと絶縁'
}

export function toCanonicalPixels(distance: number): number {
  return Math.round(distance * 390)
}
