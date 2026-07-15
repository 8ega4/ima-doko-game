export function hashSeed(input: string): number {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function createPrng(seed: string): () => number {
  let value = hashSeed(seed)

  return () => {
    value += 0x6d2b79f5
    let output = value
    output = Math.imul(output ^ (output >>> 15), output | 1)
    output ^= output + Math.imul(output ^ (output >>> 7), output | 61)
    return ((output ^ (output >>> 14)) >>> 0) / 4294967296
  }
}

export function createSeed(): string {
  const values = new Uint32Array(2)
  crypto.getRandomValues(values)
  return `${values[0].toString(36)}${values[1].toString(36)}`
}

export function sanitizeSeed(value: string | null): string | null {
  if (!value || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    return null
  }

  return value
}
