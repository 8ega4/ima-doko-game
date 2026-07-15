import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadStoredState, saveStoredState } from './storage'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('local storage', () => {
  it('falls back safely when saved JSON is broken', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{bad json' })
    expect(loadStoredState()).toEqual({ version: 1, bestScore: null, muted: false })
  })

  it('writes a versioned payload', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { setItem })
    saveStoredState({ bestScore: 210, muted: true })
    expect(setItem).toHaveBeenCalledWith('ima-doko:v1', JSON.stringify({ version: 1, bestScore: 210, muted: true }))
  })
})
