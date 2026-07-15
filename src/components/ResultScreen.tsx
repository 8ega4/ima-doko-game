import { useMemo, useState } from 'react'
import { copyChallengeUrl, downloadShareCard, openXIntent, selectFeaturedRound, shareResult } from '../game/share'
import type { GameResult } from '../game/types'
import { Icon } from './Icon'
import { ResultCanvas } from './ResultCanvas'

type ResultScreenProps = {
  result: GameResult
  onReplay: () => void
}

export function ResultScreen({ result, onReplay }: ResultScreenProps) {
  const featured = useMemo(() => selectFeaturedRound(result.rounds), [result.rounds])
  const [notice, setNotice] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<void>) => {
    if (busy) return
    setBusy(true)
    setNotice('')
    try {
      await action()
    } catch {
      setNotice('共有に失敗しました。もう一度お試しください。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="screen result-screen">
      <header className="result-header"><span>結果</span></header>
      <section className="result-content">
        <div className="result-score">
          <div><strong>{result.totalScore}</strong><span>/ 300</span></div>
          <h1>{result.title}</h1>
        </div>

        <div className="result-field-wrap">
          <ResultCanvas result={featured} />
          <p>誤差 <strong>{featured.errorPx}px</strong></p>
        </div>

        <div className="round-summary" aria-label="ラウンド別得点">
          {result.rounds.map((round, index) => (
            <div key={round.round.index}>
              <span>ROUND {index + 1}</span>
              <strong>{round.score}</strong>
            </div>
          ))}
        </div>

        <button className="primary-button replay-button" type="button" onClick={onReplay}>もう一回</button>

        <div className="share-actions">
          <button type="button" onClick={() => openXIntent(result)}>
            <Icon name="challenge" />
            <span>同じ軌道で挑戦</span>
          </button>
          <button type="button" disabled={busy} onClick={() => run(async () => {
            const outcome = await shareResult(result)
            if (outcome === 'fallback') {
              openXIntent(result)
              setNotice('画像は保存して投稿へ添付できます。')
            }
          })}>
            <Icon name="share" />
            <span>共有</span>
          </button>
          <button type="button" disabled={busy} onClick={() => run(async () => {
            await downloadShareCard(result)
            setNotice('結果画像を保存しました。')
          })}>
            <Icon name="image" />
            <span>画像保存</span>
          </button>
          <button type="button" disabled={busy} onClick={() => run(async () => {
            await copyChallengeUrl(result.seed)
            setNotice('同じ軌道のリンクをコピーしました。')
          })}>
            <Icon name="copy" />
            <span>リンクコピー</span>
          </button>
        </div>
        <p className="share-notice" aria-live="polite">{notice || '\u00a0'}</p>
        <p className="result-challenge">あなたなら当てられる？</p>
      </section>
    </main>
  )
}
