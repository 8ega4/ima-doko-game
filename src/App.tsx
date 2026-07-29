import { useEffect, useMemo, useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { PlayScreen } from './components/PlayScreen'
import { ResultScreen } from './components/ResultScreen'
import { TitleScreen } from './components/TitleScreen'
import { playTone, unlockAudio } from './game/audio'
import { createSeed, sanitizeSeed } from './game/prng'
import { loadStoredState, saveStoredState } from './game/storage'
import type { GameResult } from './game/types'

type Screen = 'title' | 'play' | 'result'

export default function App() {
  const initialChallengeSeed = useMemo(() => sanitizeSeed(new URLSearchParams(window.location.search).get('seed')), [])
  const [isLandingPage, setIsLandingPage] = useState(() => /\/lp\/?$/.test(window.location.pathname))
  const initialStoredState = useMemo(loadStoredState, [])
  const [screen, setScreen] = useState<Screen>('title')
  const [seed, setSeed] = useState(() => initialChallengeSeed ?? createSeed())
  const [result, setResult] = useState<GameResult | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(initialStoredState.bestScore)
  const [muted, setMuted] = useState(initialStoredState.muted)
  const [relaxed, setRelaxed] = useState(false)
  const [isNewBest, setIsNewBest] = useState(false)

  useEffect(() => {
    const syncScreenWithPath = () => {
      setScreen('title')
      setIsLandingPage(/\/lp\/?$/.test(window.location.pathname))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('popstate', syncScreenWithPath)
    return () => window.removeEventListener('popstate', syncScreenWithPath)
  }, [])

  const updateStorage = (nextBest: number | null, nextMuted: boolean) => {
    saveStoredState({ bestScore: nextBest, muted: nextMuted })
  }

  const toggleMute = () => {
    const next = !muted
    if (!next) {
      void unlockAudio(false).then((unlocked) => {
        if (unlocked) playTone('start', false)
      })
    }
    setMuted(next)
    updateStorage(bestScore, next)
  }

  const startGame = () => {
    void unlockAudio(muted)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setScreen('play')
  }

  const showGameTop = () => {
    const gamePath = window.location.pathname.replace(/\/lp\/?$/, '/')
    window.history.pushState({}, '', `${gamePath}${window.location.search}`)
    setIsLandingPage(false)
    setScreen('title')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (screen === 'play') {
    return (
      <PlayScreen
        seed={seed}
        muted={muted}
        relaxed={relaxed}
        onToggleMute={toggleMute}
        onComplete={(gameResult) => {
          const improved = bestScore === null || gameResult.totalScore > bestScore
          const nextBest = Math.max(bestScore ?? 0, gameResult.totalScore)
          setResult(gameResult)
          setBestScore(nextBest)
          setIsNewBest(improved)
          updateStorage(nextBest, muted)
          setScreen('result')
        }}
      />
    )
  }

  if (screen === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        isNewBest={isNewBest}
        onReplay={() => {
          const nextSeed = createSeed()
          setSeed(nextSeed)
          setResult(null)
          setIsNewBest(false)
          window.history.replaceState({}, '', window.location.pathname)
          setScreen('play')
        }}
      />
    )
  }

  return isLandingPage
    ? (
        <LandingPage
          bestScore={bestScore}
          muted={muted}
          relaxed={relaxed}
          onEnterGame={showGameTop}
          onToggleMute={toggleMute}
          onToggleRelaxed={() => setRelaxed((current) => !current)}
        />
      )
    : (
        <TitleScreen
          bestScore={bestScore}
          muted={muted}
          relaxed={relaxed}
          isChallenge={initialChallengeSeed !== null}
          onStart={startGame}
          onToggleMute={toggleMute}
          onToggleRelaxed={() => setRelaxed((current) => !current)}
        />
      )
}
