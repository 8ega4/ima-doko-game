import { useMemo, useState } from 'react'
import {
  copyChallengeUrl,
  downloadShareCard,
  openLineShare,
  openThreadsIntent,
  openXIntent,
  selectFeaturedRound,
  shareResult,
} from '../game/share'
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

  const shareChallenge = () => run(async () => {
    const outcome = await shareResult(result)
    if (outcome === 'fallback') {
      await downloadShareCard(result)
      setNotice('共有用の画像を保存しました。お好きなSNSでシェアしてください。')
    } else if (outcome === 'shared') {
      setNotice('共有を完了しました。')
    }
  })

  const openPlatform = (open: (gameResult: GameResult) => void, message: string) => {
    setNotice(message)
    open(result)
  }

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
          <p className="share-heading">挑戦状をシェア</p>
          <div className="platform-share-grid" aria-label="SNSを選んで挑戦状をシェア">
            <button className="platform-share-button platform-x" type="button" onClick={() => openPlatform(openXIntent, 'Xの投稿画面を開きました。')}>
              <Icon name="x" />
              <span>X</span>
            </button>
            <button className="platform-share-button platform-threads" type="button" onClick={() => openPlatform(openThreadsIntent, 'Threadsの投稿画面を開きました。')}>
              <Icon name="threads" />
              <span>Threads</span>
            </button>
            <button className="platform-share-button platform-challenge" type="button" disabled={busy} onClick={shareChallenge}>
              <Icon name="challenge" />
              <span>挑戦状を送る</span>
            </button>
            <button className="platform-share-button platform-line" type="button" onClick={() => openPlatform(openLineShare, 'LINEの共有画面を開きました。')}>
              <Icon name="line" />
              <span>LINE</span>
            </button>
          </div>
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
