const LANDING_SHARE_TITLE = 'いま、どこ？－消えたボール'
const LANDING_SHARE_CAPTION = [
  '消えたボールを、頭の中で追え。',
  '物理予測×空間認識の全5ラウンド・500点満点ゲーム。',
  'あなたは最後まで追える？',
  '',
  '#いまどこゲーム',
].join('\n')

type LandingShareSource = 'x' | 'threads' | 'line' | 'native' | 'copy'

export function createLandingShareUrl(source: LandingShareSource): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', 'social')
  url.searchParams.set('utm_campaign', 'ima_doko_lp')
  return url.toString()
}

export function createLandingShareText(source: LandingShareSource): string {
  return `${LANDING_SHARE_CAPTION}\n${createLandingShareUrl(source)}`
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const input = document.createElement('textarea')
  input.value = text
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('リンクをコピーできませんでした')
}

export async function copyLandingShareUrl(): Promise<void> {
  await copyText(createLandingShareUrl('copy'))
}

export function openLandingXShare(): void {
  const url = new URL('https://x.com/intent/post')
  url.searchParams.set('text', createLandingShareText('x'))
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function openLandingThreadsShare(): void {
  const url = new URL('https://www.threads.com/intent/post')
  url.searchParams.set('text', createLandingShareText('threads'))
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function openLandingLineShare(): void {
  const url = new URL('https://social-plugins.line.me/lineit/share')
  url.searchParams.set('url', createLandingShareUrl('line'))
  url.searchParams.set('text', LANDING_SHARE_CAPTION)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function shareLandingPage(): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = createLandingShareUrl('native')
  if (navigator.share) {
    try {
      await navigator.share({
        title: LANDING_SHARE_TITLE,
        text: LANDING_SHARE_CAPTION,
        url,
      })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      throw error
    }
  }

  await copyText(url)
  return 'copied'
}
