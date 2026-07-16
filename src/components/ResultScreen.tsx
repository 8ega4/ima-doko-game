import { useMemo, useState } from 'react'
import { copyChallengeUrl, downloadShareCard, openXIntent, selectFeaturedRound, shareResult } from '../game/share'
import type { GameResult } from '../game/types'
import { Icon } from './Icon'
import { ResultCanvas } from './ResultCanvas'

type ResultScreenProps = {
  result: GameResult
  isNewBest: boolean
  onReplay: () => void
}

export function ResultScreen({ result, isNewBest, onReplay }: ResultScreenProps) {
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

  const sendChallenge = () => run(async () => {
    const outcome = await shareResult(result)
    if (outcome === 'fallback') {
      openXIntent(result)
      setNotice('Xの投稿画面を開きました。')
    } else if (outcome === 'shared') {
      setNotice('SNSに挑戦状を共有しました。')
    }
  })

  return (
    <main className="screen result-screen">
      <header className="result-header"><span>結果</span></header>
      <section className="result-content">
        <div className="result-score">
          <div className="score-lockup">
            <strong>{result.totalScore}</strong><span>/ 300</span>
            {isNewBest && <em>NEW BEST</em>}
          </div>
          <h1>{result.title}</h1>
        </div>

        <div className="result-field-wrap">
          <ResultCanvas result={featured} />
          <p><span>誤差</span> <strong>{featured.errorPx}px</strong></p>
        </div>

        <div className="round-summary" aria-label="ラウンド別得点">
          {result.rounds.map((round, index) => (
            <div key={round.round.index}>
              <span>R{index + 1}</span>
              <strong>{round.score}</strong>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="primary-button replay-button" type="button" onClick={onReplay}>もう一度プレイ</button>
          <button className="challenge-button" type="button" disabled={busy} onClick={sendChallenge}>
            <Icon name="challenge" />
            <span>SNSで挑戦状を送る</span>
          </button>
          <p>X・Threadsなどにシェア</p>
        </div>

        <p className="share-notice" aria-live="polite">{notice || '\u00a0'}</p>

        <details className="share-more">
          <summary>保存・リンク</summary>
          <div>
            <button type="button" disabled={busy} onClick={() => run(async () => {
              await downloadShareCard(result)
              setNotice('結果画像を保存しました。')
            })}>
              <Icon name="image" />
              <span>結果画像を保存</span>
            </button>
            <button type="button" disabled={busy} onClick={() => run(async () => {
              await copyChallengeUrl(result.seed)
              setNotice('同じ軌道のリンクをコピーしました。')
            })}>
              <Icon name="copy" />
              <span>リンクをコピー</span>
            </button>
          </div>
        </details>
      </section>
    </main>
  )
}
