type ToneKind = 'start' | 'hide' | 'hit' | 'miss' | 'finish'

const TONES: Record<ToneKind, { frequency: number; duration: number }> = {
  start: { frequency: 520, duration: 0.08 },
  hide: { frequency: 280, duration: 0.08 },
  hit: { frequency: 760, duration: 0.12 },
  miss: { frequency: 150, duration: 0.15 },
  finish: { frequency: 620, duration: 0.2 },
}

let audioContext: AudioContext | null = null

export async function unlockAudio(muted: boolean): Promise<void> {
  if (muted) return
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') await audioContext.resume()
  } catch {
    // Audio is optional and may be unavailable in the browser.
  }
}

export function playTone(kind: ToneKind, muted: boolean): void {
  if (muted) return
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const tone = TONES[kind]
    oscillator.type = kind === 'miss' ? 'sawtooth' : 'sine'
    oscillator.frequency.setValueAtTime(tone.frequency, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + tone.duration + 0.02)
  } catch {
    // Audio is optional and may be blocked by the browser.
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Haptics are optional.
  }
}
