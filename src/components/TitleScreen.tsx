import { Icon } from './Icon'

type TitleScreenProps = {
  bestScore: number | null
  muted: boolean
  isChallenge: boolean
  onStart: () => void
  onToggleMute: () => void
}

export function TitleScreen({ bestScore, muted, isChallenge, onStart, onToggleMute }: TitleScreenProps) {
  return (
    <main className="screen title-screen">
      <header className="title-header">
        <h1>いま、どこ？</h1>
        <button className="sound-button" type="button" onClick={onToggleMute} aria-label={muted ? '音を出す' : '音を消す'}>
          <Icon name={muted ? 'mute' : 'sound'} />
          <span>音 {muted ? 'OFF' : 'ON'}</span>
        </button>
      </header>

      <section className="title-content">
        <div className="title-copy">
          <p className="title-subline">消えたボールの位置を当てろ</p>
          <p className="title-description">見える。消える。頭の中で追い続ける。</p>
        </div>

        <div className="demo-field" aria-hidden="true">
          <div className="demo-grid" />
          <div className="demo-path-solid" />
          <div className="demo-path-dotted" />
          <div className="demo-ball" />
          <div className="demo-prompt">いま、どこ？</div>
        </div>

        <div className="title-actions">
          <button className="primary-button" type="button" onClick={onStart}>
            {isChallenge ? '同じ軌道で挑戦' : 'プレイ'}
          </button>
          {bestScore !== null && <p className="best-score">自己ベスト <strong>{bestScore}</strong> / 300</p>}
        </div>
      </section>
    </main>
  )
}
