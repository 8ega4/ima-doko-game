import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { distanceBetween } from '../game/physics'
import { JUDGE_DURATION_MS } from '../game/constants'
import { generateRoundSpecs } from '../game/rounds'
import { getTitle, scoreDistance, toCanonicalPixels } from '../game/scoring'
import { playTone, vibrate } from '../game/audio'
import type { GamePhase, GameResult, Point, RoundResult } from '../game/types'
import { GameCanvas } from './GameCanvas'
import { Icon } from './Icon'

type PlayScreenProps = {
  seed: string
  muted: boolean
  relaxed: boolean
  onToggleMute: () => void
  onComplete: (result: GameResult) => void
}

const PHASE_DURATION: Record<GamePhase, number> = {
  roundIntro: 500,
  visible: 1200,
  hidden: 0,
  judgeFrozen: JUDGE_DURATION_MS,
  reveal: 1650,
}

export function PlayScreen({ seed, muted, relaxed, onToggleMute, onComplete }: PlayScreenProps) {
  const rounds = useMemo(() => generateRoundSpecs(seed), [seed])
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('roundIntro')
  const [phaseStartedAt, setPhaseStartedAt] = useState(() => performance.now())
  const [guess, setGuess] = useState<Point | null>(null)
  const [results, setResults] = useState<RoundResult[]>([])
  const pausedAtRef = useRef<number | null>(null)
  const transitioningRef = useRef(false)
  const submittedRef = useRef(false)
  const round = rounds[roundIndex]
  const cumulativeScore = results.reduce((sum, result) => sum + result.score, 0)

  const transition = useCallback((nextPhase: GamePhase) => {
    setPhaseStartedAt(performance.now())
    setPhase(nextPhase)
  }, [])

  const submitGuess = useCallback((point: Point | null) => {
    if (phase !== 'judgeFrozen' || submittedRef.current) return
    submittedRef.current = true
    const distance = point ? distanceBetween(point, round.target) : 1
    const result: RoundResult = {
      round,
      guess: point,
      distance,
      errorPx: toCanonicalPixels(distance),
      score: point ? scoreDistance(distance) : 0,
    }
    setGuess(point)
    setResults((current) => [...current, result])
    playTone(result.score >= 80 ? 'hit' : 'miss', muted)
    vibrate(result.score >= 80 ? 35 : [40, 35, 80])
    transition('reveal')
  }, [muted, phase, round, transition])

  useEffect(() => {
    transitioningRef.current = false
    let frame = 0
    const tick = () => {
      if (pausedAtRef.current === null && !transitioningRef.current) {
        const elapsed = performance.now() - phaseStartedAt
        const duration = phase === 'hidden'
          ? round.hiddenDurationMs
          : phase === 'judgeFrozen' && relaxed
            ? Number.POSITIVE_INFINITY
            : PHASE_DURATION[phase]
        if (elapsed >= duration) {
          transitioningRef.current = true
          if (phase === 'roundIntro') {
            playTone('start', muted)
            transition('visible')
          } else if (phase === 'visible') {
            playTone('hide', muted)
            transition('hidden')
          } else if (phase === 'hidden') {
            transition('judgeFrozen')
          } else if (phase === 'judgeFrozen') {
            submitGuess(null)
          } else if (phase === 'reveal') {
            if (roundIndex === rounds.length - 1) {
              const totalScore = results.reduce((sum, result) => sum + result.score, 0)
              playTone('finish', muted)
              onComplete({ seed, rounds: results, totalScore, title: getTitle(totalScore) })
              return
            }
            setRoundIndex((index) => index + 1)
            setGuess(null)
            submittedRef.current = false
            transition('roundIntro')
          }
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [muted, onComplete, phase, phaseStartedAt, relaxed, results, round.hiddenDurationMs, roundIndex, rounds.length, seed, submitGuess, transition])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        pausedAtRef.current = performance.now()
      } else if (pausedAtRef.current !== null) {
        const pausedFor = performance.now() - pausedAtRef.current
        setPhaseStartedAt((startedAt) => startedAt + pausedFor)
        pausedAtRef.current = null
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const status = phase === 'roundIntro'
    ? `ROUND ${roundIndex + 1}`
    : phase === 'visible'
      ? '見て'
      : phase === 'hidden'
        ? '消えた'
        : phase === 'judgeFrozen'
          ? 'いま、どこ？'
          : guess
            ? `${results.at(-1)?.errorPx ?? 0}px ズレ`
            : '見失った'

  const phaseHint = phase === 'roundIntro'
    ? `反射 ${round.targetBounces}回`
    : phase === 'judgeFrozen'
      ? relaxed ? '矢印キーで照準、Enterで決定' : 'ボールがいる場所をタップ'
      : phase === 'hidden'
        ? '頭の中で追い続けて'
        : phase === 'reveal'
          ? `+${results.at(-1)?.score ?? 0} POINT`
          : '\u00a0'

  return (
    <main className={`screen play-screen phase-${phase} ${phase === 'reveal' && (results.at(-1)?.score ?? 100) < 55 ? 'is-miss' : ''}`}>
      <header className="play-header">
        <span className="brand-small">いま、どこ？</span>
        <div className="round-progress" aria-label={`3ラウンド中${roundIndex + 1}ラウンド`}>
          <span>{roundIndex + 1} / 3</span>
          <div>{rounds.map((_, index) => <i key={index} className={index <= roundIndex ? 'is-active' : ''} />)}</div>
        </div>
        <strong>{cumulativeScore}</strong>
      </header>

      <section className="play-content">
        <div className="phase-copy" role="status" aria-live="assertive">
          <h2>{status}</h2>
          <p>{phaseHint}</p>
        </div>
        <GameCanvas
          round={round}
          phase={phase}
          phaseStartedAt={phaseStartedAt}
          guess={guess}
          relaxed={relaxed}
          onGuess={submitGuess}
        />
        <p id="game-canvas-help" className="visually-hidden">
          回答中はフィールドをタップできます。キーボードでは矢印キーで照準を動かし、Enterキーで決定します。
        </p>
        <div className="play-footer">
          <span>{relaxed ? 'じっくりモード ∞' : phase === 'reveal' ? '測定完了' : roundIndex === 0 ? 'ボールは等速で反射する' : `反射 ${round.targetBounces}回`}</span>
          <button className="sound-button compact" type="button" onClick={onToggleMute} aria-label={muted ? '音を出す' : '音を消す'}>
            <Icon name={muted ? 'mute' : 'sound'} />
            <span>{muted ? 'OFF' : 'ON'}</span>
          </button>
        </div>
      </section>
    </main>
  )
}
