import { Icon } from './Icon'
import { TitleDemoCanvas } from './TitleDemoCanvas'

type TitleScreenProps = {
  bestScore: number | null
  muted: boolean
  relaxed: boolean
  isChallenge: boolean
  onStart: () => void
  onToggleMute: () => void
  onToggleRelaxed: () => void
}

export function TitleScreen({ bestScore, muted, relaxed, isChallenge, onStart, onToggleMute, onToggleRelaxed }: TitleScreenProps) {
  return (
    <main className="screen title-screen">
      <header className="title-header">
        <h1>いま、どこ？</h1>
        <button className="sound-button" type="button" onClick={onToggleMute} aria-label={muted ? '音を出す' : '音を消す'}>
          <Icon name={muted ? 'mute' : 'sound'} />
        </button>
      </header>

      <section className="title-content">
        <div className="title-copy">
          <p className="title-kicker">消えたあとも、追えるか。</p>
          <p className="title-subline">消えたボールの位置を当てろ</p>
          <p className="title-description">見える。消える。頭の中で追い続ける。</p>
        </div>

        <div className="demo-field">
          <TitleDemoCanvas />
          <div className="demo-prompt" aria-hidden="true">いま、どこ？</div>
        </div>

        <div className="title-actions">
          <div className="game-meta" aria-label="3ラウンド、約15秒、1タップで遊べます">
            <span>3 ROUND</span>
            <span>約15秒</span>
            <span>1 TAP</span>
          </div>
          <button className="primary-button" type="button" onClick={onStart}>
            {isChallenge ? '同じ軌道で挑戦' : 'プレイ'}
          </button>
          {bestScore !== null && <p className="best-score">自己ベスト <strong>{bestScore}</strong> / 300</p>}
          <button className="mode-toggle" type="button" aria-pressed={relaxed} onClick={onToggleRelaxed}>
            <span>じっくりモード</span>
            <strong>{relaxed ? 'ON' : 'OFF'}</strong>
            <small>回答時間の制限なし</small>
          </button>
        </div>
      </section>
    </main>
  )
}
