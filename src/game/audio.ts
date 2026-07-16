type ToneKind = 'start' | 'finalStart' | 'hide' | 'hit' | 'miss' | 'finish'

const TONES: Record<ToneKind, { frequency: number; duration: number }> = {
  start: { frequency: 520, duration: 0.08 },
  finalStart: { frequency: 880, duration: 0.12 },
  hide: { frequency: 280, duration: 0.08 },
  hit: { frequency: 760, duration: 0.12 },
  miss: { frequency: 150, duration: 0.15 },
  finish: { frequency: 620, duration: 0.2 },
}

let audioContext: AudioContext | null = null

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

function getAudioContext(): AudioContext | null {
  if (audioContext?.state === 'closed') audioContext = null
  if (audioContext) return audioContext

  const audioWindow = window as AudioWindow
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
  if (!AudioContextConstructor) return null
  audioContext = new AudioContextConstructor()
  return audioContext
}

function primeAudioContext(context: AudioContext): void {
  const buffer = context.createBuffer(1, 1, context.sampleRate)
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(0)
}

export async function unlockAudio(muted: boolean): Promise<boolean> {
  if (muted) return false
  try {
    const context = getAudioContext()
    if (!context) return false

    // Starting a silent buffer inside the tap gesture unlocks Web Audio on iOS.
    primeAudioContext(context)
    if (context.state === 'suspended') await context.resume()
    return context.state === 'running'
  } catch {
    // Audio is optional and may be unavailable in the browser.
    return false
  }
}

export function playTone(kind: ToneKind, muted: boolean): void {
  if (muted) return
  try {
    const context = getAudioContext()
    if (!context) return

    const emit = () => {
      if (context.state !== 'running') return
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const tone = TONES[kind]
      oscillator.type = kind === 'miss' ? 'sawtooth' : 'sine'
      oscillator.frequency.setValueAtTime(tone.frequency, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + tone.duration + 0.02)
    }

    if (context.state === 'suspended') {
      void context.resume().then(emit).catch(() => undefined)
      return
    }
    emit()
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
