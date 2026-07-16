import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateRoundSpecs } from './rounds'
import {
  createChallengeUrl,
  createLineShareUrl,
  createShareText,
  createThreadsIntentUrl,
  createXIntentUrl,
  selectFeaturedRound,
} from './share'
import type { GameResult, Point, RoundResult } from './types'

const specs = generateRoundSpecs('share-test')

function result(index: number, distance: number, guess: Point | null): RoundResult {
  return {
    round: specs[index],
    guess,
    distance,
    errorPx: Math.round(distance * 390),
    score: Math.round((1 - distance) * 100),
  }
}

const gameResult: GameResult = {
  seed: 'same-course',
  rounds: [result(0, 0.02, { x: 0.5, y: 0.5 }), result(1, 0.18, { x: 0.2, y: 0.7 }), result(2, 1, null)],
  totalScore: 180,
  title: '追跡者',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('result sharing', () => {
  it('features a near-perfect answered round', () => {
    expect(selectFeaturedRound(gameResult.rounds)).toBe(gameResult.rounds[0])
  })

  it('never selects a timeout when an answered round exists', () => {
    const rounds = [result(0, 0.1, { x: 0.4, y: 0.4 }), result(1, 1, null), result(2, 0.3, { x: 0.7, y: 0.7 })]
    expect(selectFeaturedRound(rounds)).toBe(rounds[2])
  })

  it('builds a reproducible challenge URL and share text', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/game?old=1#top' } })
    expect(createChallengeUrl('seed 42')).toBe('https://example.com/game?seed=seed+42')
    expect(createShareText(gameResult)).toContain('同じ軌道で勝負 → https://example.com/game?seed=same-course')
  })

  it('encodes the result in an X Web Intent URL', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/game' } })
    const url = new URL(createXIntentUrl(gameResult))
    expect(url.origin + url.pathname).toBe('https://x.com/intent/post')
    expect(url.searchParams.get('text')).toContain('180/300点')
    expect(url.searchParams.get('text')).toContain('#いまどこゲーム')
  })

  it('encodes the result in a Threads Web Intent URL', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/game' } })
    const url = new URL(createThreadsIntentUrl(gameResult))
    expect(url.origin + url.pathname).toBe('https://www.threads.com/intent/post')
    expect(url.searchParams.get('text')).toContain('180/300点')
    expect(url.searchParams.get('text')).toContain('https://example.com/game?seed=same-course')
  })

  it('builds a LINE share URL without duplicating the challenge link in its text', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/game' } })
    const url = new URL(createLineShareUrl(gameResult))
    expect(url.origin + url.pathname).toBe('https://social-plugins.line.me/lineit/share')
    expect(url.searchParams.get('url')).toBe('https://example.com/game?seed=same-course')
    expect(url.searchParams.get('text')).toContain('180/300点')
    expect(url.searchParams.get('text')).not.toContain('https://example.com/game')
  })
})
