import { MAX_TOTAL_SCORE } from './constants'

const STORAGE_KEY = 'ima-doko:v1'

type StoredState = {
  version: 1
  bestScore: number | null
  muted: boolean
}

const DEFAULT_STATE: StoredState = {
  version: 1,
  bestScore: null,
  muted: false,
}

function normalizeBestScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(MAX_TOTAL_SCORE, Math.round(value)))
}

export function loadStoredState(): StoredState {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return DEFAULT_STATE
    const parsed = JSON.parse(value) as Partial<StoredState>
    if (parsed.version !== 1) return DEFAULT_STATE

    return {
      version: 1,
      bestScore: normalizeBestScore(parsed.bestScore),
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveStoredState(state: Omit<StoredState, 'version'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      bestScore: normalizeBestScore(state.bestScore),
      muted: state.muted,
    }))
  } catch {
    // Storage is an enhancement; gameplay remains available when it is blocked.
  }
}
