export type Point = {
  x: number
  y: number
}

export type MotionState = Point & {
  vx: number
  vy: number
}

export type MotionTrace = {
  state: MotionState
  points: Point[]
  bounces: number
}

export type RoundSpec = {
  index: number
  visibleDurationMs: number
  hiddenDurationMs: number
  targetBounces: number
  initial: MotionState
  visibleTrace: Point[]
  hiddenTrace: Point[]
  target: Point
}

export type RoundResult = {
  round: RoundSpec
  guess: Point | null
  distance: number
  errorPx: number
  score: number
}

export type GameResult = {
  seed: string
  rounds: RoundResult[]
  totalScore: number
  title: string
}

export type GamePhase =
  | 'roundIntro'
  | 'visible'
  | 'hidden'
  | 'judgeFrozen'
  | 'reveal'
