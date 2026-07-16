import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('audio unlocking', () => {
  it('primes and resumes Web Audio inside the user gesture', async () => {
    const start = vi.fn()
    const connect = vi.fn()
    const resume = vi.fn(async () => undefined)

    class FakeAudioContext {
      state: AudioContextState = 'suspended'
      sampleRate = 44100
      destination = {}

      createBuffer() {
        return {}
      }

      createBufferSource() {
        return { buffer: null, connect, start }
      }

      async resume() {
        await resume()
        this.state = 'running'
      }
    }

    vi.stubGlobal('window', { AudioContext: FakeAudioContext })
    const { unlockAudio } = await import('./audio')

    await expect(unlockAudio(false)).resolves.toBe(true)
    expect(connect).toHaveBeenCalledOnce()
    expect(start).toHaveBeenCalledWith(0)
    expect(resume).toHaveBeenCalledOnce()
  })

  it('does not create an audio context while muted', async () => {
    const AudioContextConstructor = vi.fn()
    vi.stubGlobal('window', { AudioContext: AudioContextConstructor })
    const { unlockAudio } = await import('./audio')

    await expect(unlockAudio(true)).resolves.toBe(false)
    expect(AudioContextConstructor).not.toHaveBeenCalled()
  })
})
