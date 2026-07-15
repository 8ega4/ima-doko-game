import { drawResultField, COLORS } from './rendering'
import type { GameResult, RoundResult } from './types'

export function selectFeaturedRound(rounds: RoundResult[]): RoundResult {
  const answeredRounds = rounds.filter((round) => round.guess !== null)
  const candidates = answeredRounds.length > 0 ? answeredRounds : rounds
  const closest = [...candidates].sort((a, b) => a.distance - b.distance)[0]
  if (closest && closest.distance <= 0.035) return closest
  return [...candidates].sort((a, b) => b.distance - a.distance)[0]
}

export function createChallengeUrl(seed: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('seed', seed)
  return url.toString()
}

export function createShareText(result: GameResult): string {
  const bestError = Math.min(...result.rounds.map((round) => round.errorPx))
  return `消えたボール、最小誤差${bestError}px。\n${result.totalScore}/300点、称号「${result.title}」でした。\n同じ軌道で勝負 → ${createChallengeUrl(result.seed)}\n#いまどこゲーム`
}

export async function copyChallengeUrl(seed: string): Promise<void> {
  const url = createChallengeUrl(seed)
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    return
  }
  const input = document.createElement('textarea')
  input.value = url
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('リンクをコピーできませんでした')
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('画像を生成できませんでした'))
    }, 'image/png')
  })
}

export async function generateShareCard(result: GameResult): Promise<File> {
  const width = 1200
  const height = 1500
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvasを利用できません')

  context.fillStyle = COLORS.background
  context.fillRect(0, 0, width, height)
  context.fillStyle = COLORS.cyan
  context.fillRect(72, 74, 220, 8)
  context.fillRect(width - 292, 74, 220, 8)

  context.textAlign = 'center'
  context.fillStyle = COLORS.white
  context.font = '800 64px system-ui, sans-serif'
  context.fillText('いま、どこ？', width / 2, 104)
  context.font = '900 150px system-ui, sans-serif'
  context.fillText(`${result.totalScore}`, width / 2 - 72, 290)
  context.font = '800 58px system-ui, sans-serif'
  context.fillText('/ 300', width / 2 + 210, 286)
  context.fillStyle = COLORS.yellow
  context.font = '900 76px system-ui, sans-serif'
  context.fillText(result.title, width / 2, 380)

  const featured = selectFeaturedRound(result.rounds)
  const field = document.createElement('canvas')
  field.width = 960
  field.height = 960
  const fieldContext = field.getContext('2d')
  if (!fieldContext) throw new Error('Canvasを利用できません')
  drawResultField(fieldContext, 960, featured)
  context.drawImage(field, 120, 430, 960, 960)

  context.fillStyle = COLORS.coral
  context.fillRect(120, 1360, 960, 4)
  context.fillStyle = COLORS.white
  context.font = '800 48px system-ui, sans-serif'
  context.fillText(`誤差 ${featured.errorPx}px`, width / 2, 1420)
  context.fillStyle = COLORS.cyan
  context.font = '700 30px system-ui, sans-serif'
  context.fillText('あなたなら当てられる？　#いまどこゲーム', width / 2, 1460)
  const challengeUrl = new URL(createChallengeUrl(result.seed))
  const challengeLabel = `${challengeUrl.host}${challengeUrl.pathname}`.replace(/\/$/, '')
  context.fillStyle = COLORS.yellow
  context.font = '800 25px ui-monospace, monospace'
  context.fillText(challengeLabel, width / 2, 1492, 1000)

  const blob = await canvasToBlob(canvas)
  return new File([blob], 'ima-doko-result.png', { type: 'image/png' })
}

export async function shareResult(result: GameResult): Promise<'shared' | 'fallback' | 'cancelled'> {
  const text = createShareText(result)
  const file = await generateShareCard(result)
  const shareData = { title: 'いま、どこ？', text, files: [file] }

  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  return 'fallback'
}

export async function downloadShareCard(result: GameResult): Promise<void> {
  const file = await generateShareCard(result)
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function openXIntent(result: GameResult): void {
  window.open(createXIntentUrl(result), '_blank', 'noopener,noreferrer')
}

export function createXIntentUrl(result: GameResult): string {
  const url = new URL('https://x.com/intent/post')
  url.searchParams.set('text', createShareText(result))
  return url.toString()
}
