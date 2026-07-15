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

export function loadStoredState(): StoredState {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return DEFAULT_STATE
    const parsed = JSON.parse(value) as Partial<StoredState>
    if (parsed.version !== 1) return DEFAULT_STATE

    return {
      version: 1,
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : null,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveStoredState(state: Omit<StoredState, 'version'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...state }))
  } catch {
    // Storage is an enhancement; gameplay remains available when it is blocked.
  }
}
