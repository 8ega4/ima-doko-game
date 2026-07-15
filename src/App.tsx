import { useMemo, useState } from 'react'
import { PlayScreen } from './components/PlayScreen'
import { ResultScreen } from './components/ResultScreen'
import { TitleScreen } from './components/TitleScreen'
import { unlockAudio } from './game/audio'
import { createSeed, sanitizeSeed } from './game/prng'
import { loadStoredState, saveStoredState } from './game/storage'
import type { GameResult } from './game/types'

type Screen = 'title' | 'play' | 'result'

export default function App() {
  const initialChallengeSeed = useMemo(() => sanitizeSeed(new URLSearchParams(window.location.search).get('seed')), [])
  const initialStoredState = useMemo(loadStoredState, [])
  const [screen, setScreen] = useState<Screen>('title')
  const [seed, setSeed] = useState(() => initialChallengeSeed ?? createSeed())
  const [result, setResult] = useState<GameResult | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(initialStoredState.bestScore)
  const [muted, setMuted] = useState(initialStoredState.muted)

  const updateStorage = (nextBest: number | null, nextMuted: boolean) => {
    saveStoredState({ bestScore: nextBest, muted: nextMuted })
  }

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current
      if (!next) void unlockAudio(false)
      updateStorage(bestScore, next)
      return next
    })
  }

  if (screen === 'play') {
    return (
      <PlayScreen
        seed={seed}
        muted={muted}
        onToggleMute={toggleMute}
        onComplete={(gameResult) => {
          const nextBest = Math.max(bestScore ?? 0, gameResult.totalScore)
          setResult(gameResult)
          setBestScore(nextBest)
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
        onReplay={() => {
          const nextSeed = createSeed()
          setSeed(nextSeed)
          setResult(null)
          window.history.replaceState({}, '', window.location.pathname)
          setScreen('play')
        }}
      />
    )
  }

  return (
    <TitleScreen
      bestScore={bestScore}
      muted={muted}
      isChallenge={initialChallengeSeed !== null}
      onToggleMute={toggleMute}
      onStart={() => {
        void unlockAudio(muted)
        setScreen('play')
      }}
    />
  )
}
