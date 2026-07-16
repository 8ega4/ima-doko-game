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

        <div className="result-actions" aria-label="結果をシェア">
          <button className="share-action share-action-x" type="button" onClick={() => openPlatform(openXIntent, 'Xの投稿画面を開きました。')}>
            <Icon name="x" />
            <span>Xで共有</span>
          </button>

          <div className="share-action-row">
            <button className="share-action share-action-threads" type="button" onClick={() => openPlatform(openThreadsIntent, 'Threadsの投稿画面を開きました。')}>
              <Icon name="threads" />
              <span>Threadsで共有</span>
            </button>
            <button className="share-action share-action-line" type="button" onClick={() => openPlatform(openLineShare, 'LINEの共有画面を開きました。')}>
              <Icon name="line" />
              <span>LINEで送る</span>
            </button>
          </div>

          <div className="share-action-row share-action-row-utility">
            <button className="share-action share-action-utility" type="button" disabled={busy} onClick={shareChallenge}>
              <Icon name="share" />
              <span>シェア先を選ぶ</span>
            </button>
            <button className="share-action share-action-utility" type="button" disabled={busy} onClick={() => run(async () => {
              await copyChallengeUrl(result.seed)
              setNotice('同じ軌道のリンクをコピーしました。')
            })}>
              <Icon name="copy" />
              <span>リンクをコピー</span>
            </button>
          </div>

          <p className="share-notice" aria-live="polite">{notice || '\u00a0'}</p>

          <button className="primary-button replay-button" type="button" onClick={onReplay}>
            <Icon name="replay" />
            <span>もう一度プレイ</span>
          </button>
        </div>
      </section>
    </main>
  )
}
