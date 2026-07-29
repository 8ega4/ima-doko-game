import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Play,
} from '@phosphor-icons/react'
import { Icon } from './Icon'
import { TitleDemoCanvas } from './TitleDemoCanvas'
import {
  ESTIMATED_PLAY_SECONDS,
  MAX_TOTAL_SCORE,
  ROUND_DIFFICULTY,
  TOTAL_ROUNDS,
} from '../game/constants'
import {
  copyLandingShareUrl,
  openLandingLineShare,
  openLandingThreadsShare,
  openLandingXShare,
  shareLandingPage,
} from '../game/landingShare'

type LandingPageProps = {
  bestScore: number | null
  muted: boolean
  relaxed: boolean
  onEnterGame: () => void
  onToggleMute: () => void
  onToggleRelaxed: () => void
}

const HOW_TO_STEPS = [
  {
    number: '01',
    title: '見る',
    description: 'ボールの速さと反射角を記憶する。',
  },
  {
    number: '02',
    title: '追う',
    description: '消えたあとも、頭の中で軌道を進める。',
  },
  {
    number: '03',
    title: '当てる',
    description: '止まったと思う場所を1タップ。',
  },
] as const

const SAMPLE_ROUND_SCORES = [92, 88, 86, 84, 78] as const

const LANDING_NAV_ITEMS = [
  { href: '#how-to', label: '遊び方' },
  { href: '#difficulty', label: '難易度' },
  { href: '#result', label: '結果をシェア' },
] as const

export function LandingPage({
  bestScore,
  muted,
  relaxed,
  onEnterGame,
  onToggleMute,
  onToggleRelaxed,
}: LandingPageProps) {
  const pageRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [motionEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [introComplete, setIntroComplete] = useState(() => !motionEnabled)
  const [shareBusy, setShareBusy] = useState(false)
  const [shareNotice, setShareNotice] = useState('')

  const navigateToAnchor = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return

    const anchor = event.currentTarget.getAttribute('href')
    if (!anchor?.startsWith('#')) return

    const target = document.getElementById(decodeURIComponent(anchor.slice(1)))
    if (!target) return

    event.preventDefault()
    if (window.location.hash !== anchor) {
      window.history.pushState({}, '', anchor)
    }
    target.scrollIntoView({
      behavior: motionEnabled ? 'smooth' : 'auto',
      block: 'start',
    })
  }

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll-enabled')
    return () => document.documentElement.classList.remove('landing-scroll-enabled')
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const syncHeaderOffset = () => {
      const height = header.getBoundingClientRect().height
      document.documentElement.style.setProperty('--landing-header-offset', `${height}px`)
    }

    syncHeaderOffset()
    const observer = 'ResizeObserver' in window
      ? new ResizeObserver(syncHeaderOffset)
      : null
    observer?.observe(header)
    window.addEventListener('resize', syncHeaderOffset, { passive: true })

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', syncHeaderOffset)
      document.documentElement.style.removeProperty('--landing-header-offset')
    }
  }, [])

  useEffect(() => {
    if (!motionEnabled) return

    const timer = window.setTimeout(() => setIntroComplete(true), 1800)
    return () => window.clearTimeout(timer)
  }, [motionEnabled])

  useEffect(() => {
    if (!introComplete || !window.location.hash) return

    const targetId = decodeURIComponent(window.location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [introComplete])

  const runShareAction = async (action: () => Promise<string | void>) => {
    if (shareBusy) return
    setShareBusy(true)
    setShareNotice('')
    try {
      const message = await action()
      if (message) setShareNotice(message)
    } catch {
      setShareNotice('共有に失敗しました。もう一度お試しください。')
    } finally {
      setShareBusy(false)
    }
  }

  const openShareDestination = (open: () => void, message: string) => {
    setShareNotice(message)
    open()
  }

  useEffect(() => {
    const page = pageRef.current
    if (!page || !motionEnabled) return

    const revealTargets = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.14,
      },
    )

    revealTargets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [motionEnabled])

  return (
    <main
      className={`landing-screen${introComplete ? ' is-ready' : ''}${motionEnabled ? ' motion-enabled' : ''}`}
      id="top"
      ref={pageRef}
    >
      {motionEnabled && !introComplete && (
        <div className="landing-opening" aria-hidden="true">
          <div className="landing-opening-grid" />
          <div className="landing-opening-stage">
            <svg viewBox="0 0 1140 520" role="presentation">
              <path
                className="landing-opening-route"
                d="M60 390 L390 390 L515 180 L690 390 L1080 130"
              />
              <circle className="landing-opening-ball" cx="0" cy="0" r="16">
                <animateMotion
                  begin=".18s"
                  dur="1.12s"
                  fill="freeze"
                  path="M60 390 L390 390 L515 180 L690 390 L1080 130"
                />
              </circle>
              <g className="landing-opening-target">
                <circle cx="1080" cy="130" r="44" />
                <circle cx="1080" cy="130" r="28" />
                <path d="M1062 130 H1098 M1080 112 V148" />
              </g>
            </svg>
            <strong className="landing-opening-wordmark">いま、どこ？</strong>
          </div>
        </div>
      )}

      <header className="landing-header" ref={headerRef}>
        <a className="landing-brand" href="#top" aria-label="いま、どこ？ トップへ" onClick={navigateToAnchor}>
          いま、どこ？
        </a>

        <nav className="landing-nav" aria-label="ページ内ナビゲーション">
          {LANDING_NAV_ITEMS.map((item) => (
            <a href={item.href} key={item.href} onClick={navigateToAnchor}>{item.label}</a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <button
            className="sound-button landing-sound-button"
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? '音を出す' : '音を消す'}
          >
            <Icon name={muted ? 'mute' : 'sound'} />
          </button>
          <button className="landing-header-cta" type="button" onClick={onEnterGame}>
            ゲームTOPへ
          </button>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <h1 id="hero-title">
            <span>消えたボールを、</span>
            <span>頭の中で追え。</span>
          </h1>
          <p className="landing-hero-lead">
            見えているのは一瞬。速さと反射角を記憶して、
            <br className="desktop-break" />
            消えた後の位置を1タップで当てる。
          </p>

          <div
            className="landing-meta"
            aria-label={`${TOTAL_ROUNDS}ラウンド、約${ESTIMATED_PLAY_SECONDS}秒、1タップで遊べます`}
          >
            <span>
              <strong>{TOTAL_ROUNDS}</strong>
              ROUND
            </span>
            <span>
              <strong>
                <small className="landing-meta-approx">約</small>
                {ESTIMATED_PLAY_SECONDS}
              </strong>
              秒
            </span>
            <span>
              <strong>1</strong>
              TAP
            </span>
          </div>

          <div className="landing-hero-actions">
            <button className="landing-primary-button" type="button" onClick={onEnterGame}>
              <Play weight="fill" aria-hidden="true" />
              ゲームTOPへ
            </button>
            <a className="landing-text-link" href="#how-to" onClick={navigateToAnchor}>
              遊び方を見る
              <ArrowDown aria-hidden="true" />
            </a>
          </div>

          <div className="landing-play-options">
            <button
              className="landing-mode-toggle"
              type="button"
              aria-pressed={relaxed}
              onClick={onToggleRelaxed}
            >
              <span>じっくりモード</span>
              <strong>{relaxed ? 'ON' : 'OFF'}</strong>
              <small>回答時間の制限なし</small>
            </button>
            {bestScore !== null && (
              <p className="landing-best-score">
                自己ベスト <strong>{bestScore}</strong> / {MAX_TOTAL_SCORE}
              </p>
            )}
          </div>
        </div>

        <div className="landing-hero-visual" aria-label="ゲームの動きのプレビュー">
          <div className="landing-demo-frame">
            <TitleDemoCanvas />
            <div className="landing-demo-caption" aria-hidden="true">
              <span>VISIBLE</span>
              <strong>いま、どこ？</strong>
            </div>
          </div>
          <p className="landing-demo-note">ボールが消えても、同じ速さで動き続けます。</p>
        </div>
      </section>

      <a className="landing-scroll-cue" href="#how-to" aria-label="遊び方へ移動" onClick={navigateToAnchor}>
        <span>SCROLL</span>
        <ArrowDown aria-hidden="true" />
      </a>

      <section className="landing-section landing-how-to" id="how-to" aria-labelledby="how-to-title">
        <div className="landing-section-heading" data-reveal="up">
          <h2 id="how-to-title">見えなくなってからが、本番。</h2>
          <p>やることは、たった3つ。</p>
          <small>物理学の知識はいりません。</small>
        </div>

        <div className="how-to-rail" data-reveal="route">
          <svg className="how-to-path" viewBox="0 0 1200 330" preserveAspectRatio="none" aria-hidden="true">
            <path className="how-to-visible-path" d="M30 210 L450 202 L610 190" />
            <path className="how-to-hidden-path" d="M610 190 L720 105 L820 205 L1160 112" />
            <path className="how-to-wall" d="M705 36 L705 104 L735 136 L705 168 L705 248" />
            <circle className="how-to-ball-shadow shadow-3" cx="45" cy="210" r="13" />
            <circle className="how-to-ball-shadow shadow-2" cx="63" cy="210" r="13" />
            <circle className="how-to-ball-shadow shadow-1" cx="81" cy="210" r="13" />
            <circle className="how-to-ball" cx="99" cy="210" r="14" />
            <circle className="how-to-target-outer" cx="1160" cy="112" r="34" />
            <circle className="how-to-target-inner" cx="1160" cy="112" r="22" />
            <path className="how-to-target-plus" d="M1148 112 H1172 M1160 100 V124" />
          </svg>

          <ol className="how-to-steps">
            {HOW_TO_STEPS.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-section landing-difficulty" id="difficulty" aria-labelledby="difficulty-title">
        <div className="difficulty-heading" data-reveal="left">
          <h2 id="difficulty-title">
            <span>5ラウンド、</span>
            <span>少しずつ追い込まれる。</span>
          </h2>
          <p>
            速さも、反射も、消えている時間も。
            <br />
            最終問題まで、<strong>同じルールで難しくなる。</strong>
          </p>
        </div>

        <div className="difficulty-visual" data-reveal="route">
          <svg className="difficulty-path" viewBox="0 0 1000 430" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="10,385 190,335 390,285 585,218 780,138 990,42" />
          </svg>
          <ol className="difficulty-rounds">
            {ROUND_DIFFICULTY.map((round, index) => (
              <li key={round.speedMultiplier} style={{ '--round-index': index } as React.CSSProperties}>
                <span>{index === TOTAL_ROUNDS - 1 ? 'FINAL ROUND' : `ROUND ${index + 1}`}</span>
                <strong>{round.speedMultiplier.toFixed(2)}×</strong>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
          <p className="difficulty-final-note">
            <strong>最高速度。</strong>
            それでも、軌道は正直だ。
          </p>
        </div>
      </section>

      <section className="landing-section landing-result" id="result" aria-labelledby="result-title">
        <div className="landing-result-copy" data-reveal="left">
          <h2 id="result-title">
            その予測は、
            <br />
            何点？
          </h2>
          <p>
            5ラウンドの誤差を採点。
            <br />
            結果画像と<strong>同じ軌道の挑戦状</strong>を、
            <br />
            そのままシェアできます。
          </p>

          <div className="landing-share-list" aria-label="このゲームをシェア">
            <button type="button" onClick={() => openShareDestination(openLandingXShare, 'Xの投稿画面を開きました。')}>
              <Icon name="x" />
              Xで共有
              <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" onClick={() => openShareDestination(openLandingThreadsShare, 'Threadsの投稿画面を開きました。')}>
              <Icon name="threads" />
              Threadsで共有
              <ArrowRight aria-hidden="true" />
            </button>
            <button className="is-line" type="button" onClick={() => openShareDestination(openLandingLineShare, 'LINEの共有画面を開きました。')}>
              <Icon name="line" />
              LINEで送る
              <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" disabled={shareBusy} onClick={() => runShareAction(async () => {
              const outcome = await shareLandingPage()
              if (outcome === 'shared') return '共有を完了しました。'
              if (outcome === 'copied') return '共有機能がないため、LPのリンクをコピーしました。'
            })}>
              <Icon name="share" />
              シェア先を選ぶ
              <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" disabled={shareBusy} onClick={() => runShareAction(async () => {
              await copyLandingShareUrl()
              return 'LPのリンクをコピーしました。'
            })}>
              <Icon name="copy" />
              リンクをコピー
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <p className="landing-share-notice" aria-live="polite">{shareNotice || '\u00a0'}</p>
        </div>

        <div className="landing-result-card" aria-label="結果画面の例" data-reveal="right">
          <p>今回の結果</p>
          <div className="landing-sample-score">
            <strong>428</strong>
            <span>/ 500</span>
          </div>
          <h3>物理学者</h3>

          <svg className="landing-result-route" viewBox="0 0 560 210" aria-hidden="true">
            <defs>
              <linearGradient id="result-route-fade" x1="0" x2="1">
                <stop offset="0" stopColor="#ff654f" />
                <stop offset="1" stopColor="#ff654f" stopOpacity=".18" />
              </linearGradient>
            </defs>
            <circle cx="65" cy="58" r="13" fill="#ff654f" />
            <path d="M76 66 L306 180 L468 68" fill="none" stroke="url(#result-route-fade)" strokeWidth="3" strokeDasharray="8 9" />
            <circle cx="468" cy="68" r="30" fill="none" stroke="#f4f700" strokeWidth="3" />
            <circle cx="468" cy="68" r="20" fill="none" stroke="#f4f700" strokeWidth="2" />
            <path d="M457 68 H479 M468 57 V79" stroke="#f4f700" strokeWidth="3" />
          </svg>

          <div className="landing-round-summary">
            {SAMPLE_ROUND_SCORES.map((score, index) => (
              <span key={score}>
                <small>R{index + 1}</small>
                <strong>{score}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-final-cta" aria-labelledby="final-cta-title">
        <div className="final-trajectory final-trajectory-left" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="final-trajectory-target" aria-hidden="true">
          <span />
        </div>
        <div data-reveal="up">
          <h2 id="final-cta-title">
            ボールは消えても、
            <br />
            軌道は消えない。
          </h2>
          <p>約{ESTIMATED_PLAY_SECONDS}秒。あなたは最後まで追えるか。</p>
          <button className="landing-primary-button landing-final-button" type="button" onClick={onEnterGame}>
            <Play weight="fill" aria-hidden="true" />
            ゲームTOPへ進む
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#top" onClick={navigateToAnchor}>いま、どこ？</a>
        <nav className="landing-footer-nav" aria-label="フッターナビゲーション">
          {LANDING_NAV_ITEMS.map((item) => (
            <a href={item.href} key={item.href} onClick={navigateToAnchor}>{item.label}</a>
          ))}
        </nav>
        <p>消えたボールの位置を当てる、ワンタップゲーム。</p>
      </footer>
    </main>
  )
}
