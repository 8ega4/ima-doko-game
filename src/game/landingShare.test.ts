import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  copyLandingShareUrl,
  createLandingShareText,
  createLandingShareUrl,
  openLandingLineShare,
  openLandingThreadsShare,
  openLandingXShare,
  shareLandingPage,
} from './landingShare'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('landing page sharing', () => {
  it('creates a clean platform-specific LP URL', () => {
    vi.stubGlobal('window', {
      location: { href: 'https://example.com/game/lp?seed=old&utm_source=test#result' },
    })

    const url = new URL(createLandingShareUrl('x'))
    expect(url.origin + url.pathname).toBe('https://example.com/game/lp')
    expect(url.searchParams.get('seed')).toBeNull()
    expect(url.searchParams.get('utm_source')).toBe('x')
    expect(url.searchParams.get('utm_medium')).toBe('social')
    expect(url.searchParams.get('utm_campaign')).toBe('ima_doko_lp')
    expect(url.hash).toBe('')
  })

  it('creates platform intents with the game description and tracked LP URL', () => {
    const open = vi.fn()
    vi.stubGlobal('window', {
      location: { href: 'https://example.com/game/lp' },
      open,
    })

    openLandingXShare()
    openLandingThreadsShare()
    openLandingLineShare()

    const xUrl = new URL(open.mock.calls[0][0])
    const threadsUrl = new URL(open.mock.calls[1][0])
    const lineUrl = new URL(open.mock.calls[2][0])
    expect(xUrl.origin + xUrl.pathname).toBe('https://x.com/intent/post')
    expect(xUrl.searchParams.get('text')).toContain('全5ラウンド・500点満点')
    expect(xUrl.searchParams.get('text')).toContain('utm_source=x')
    expect(threadsUrl.origin + threadsUrl.pathname).toBe('https://www.threads.com/intent/post')
    expect(threadsUrl.searchParams.get('text')).toContain('utm_source=threads')
    expect(lineUrl.origin + lineUrl.pathname).toBe('https://social-plugins.line.me/lineit/share')
    expect(lineUrl.searchParams.get('url')).toContain('utm_source=line')
  })

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('window', { location: { href: 'https://example.com/game/lp' } })
    vi.stubGlobal('navigator', { share })

    await expect(shareLandingPage()).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: 'いま、どこ？－消えたボール',
      url: expect.stringContaining('utm_source=native'),
    }))
  })

  it('copies the LP URL when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('window', { location: { href: 'https://example.com/game/lp' } })
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(shareLandingPage()).resolves.toBe('copied')
    await copyLandingShareUrl()
    expect(writeText.mock.calls[0][0]).toContain('utm_source=native')
    expect(writeText.mock.calls[1][0]).toContain('utm_source=copy')
  })

  it('includes the LP URL in the reusable share text', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/game/lp' } })
    expect(createLandingShareText('threads')).toContain('https://example.com/game/lp?')
    expect(createLandingShareText('threads')).toContain('#いまどこゲーム')
  })
})
