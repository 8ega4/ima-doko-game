export const TOTAL_ROUNDS = 5
export const MAX_SCORE_PER_ROUND = 100
export const MAX_TOTAL_SCORE = TOTAL_ROUNDS * MAX_SCORE_PER_ROUND

export const ROUND_INTRO_DURATION_MS = 650
export const JUDGE_DURATION_MS = 2000
export const REVEAL_DURATION_MS = 1650

export const BASE_BALL_SPEED = 0.26

export const ROUND_DIFFICULTY = [
  { speedMultiplier: 1, visibleDurationMs: 1300, hiddenDurationMs: 1200, targetBounces: 1, introLabel: '反射 1回' },
  { speedMultiplier: 1.15, visibleDurationMs: 1250, hiddenDurationMs: 1300, targetBounces: 1, introLabel: '少し加速' },
  { speedMultiplier: 1.3, visibleDurationMs: 1200, hiddenDurationMs: 1450, targetBounces: 2, introLabel: '速度アップ' },
  { speedMultiplier: 1.5, visibleDurationMs: 1100, hiddenDurationMs: 1600, targetBounces: 2, introLabel: '高速・反射 2回' },
  { speedMultiplier: 1.75, visibleDurationMs: 1000, hiddenDurationMs: 1800, targetBounces: 3, introLabel: '最終問題・最高速度' },
] as const

export const EXPECTED_ACTIVE_PLAY_DURATION_MS = ROUND_DIFFICULTY.reduce(
  (total, round) => total + ROUND_INTRO_DURATION_MS + round.visibleDurationMs + round.hiddenDurationMs + REVEAL_DURATION_MS,
  0,
)
export const ESTIMATED_PLAY_SECONDS = Math.round(EXPECTED_ACTIVE_PLAY_DURATION_MS / 1000)
